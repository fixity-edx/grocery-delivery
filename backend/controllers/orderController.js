const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Create order from cart
// @route   POST /api/orders
// @access  Private (User)
exports.createOrder = async (req, res) => {
    try {
        const { storeId, deliveryAddress, paymentMethod } = req.body;

        // Get user's cart
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        // Filter items by store
        const storeItems = cart.items.filter(
            item => item.product && item.product.store.toString() === storeId
        );

        if (storeItems.length === 0) {
            return res.status(400).json({ success: false, message: 'No items from this store in cart' });
        }

        // Validate stock and calculate pricing
        let subtotal = 0;
        const orderItems = [];

        for (const item of storeItems) {
            const product = await Product.findById(item.product._id);

            if (!product.isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: `${product.name} is no longer available`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`
                });
            }

            const itemSubtotal = product.price * item.quantity;
            subtotal += itemSubtotal;

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                subtotal: itemSubtotal
            });

            // Reduce stock
            product.stock -= item.quantity;
            await product.save();
        }

        // Calculate pricing
        const deliveryFee = subtotal >= 500 ? 0 : 40;
        const tax = subtotal * 0.05; // 5% tax
        const total = subtotal + deliveryFee + tax;

        // Create order
        const order = await Order.create({
            user: req.user._id,
            store: storeId,
            items: orderItems,
            deliveryAddress,
            pricing: {
                subtotal,
                deliveryFee,
                tax,
                total
            },
            payment: {
                method: paymentMethod,
                status: paymentMethod === 'COD' ? 'pending' : 'pending'
            },
            statusHistory: [{
                status: 'pending',
                timestamp: Date.now(),
                note: 'Order placed'
            }],
            estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000) // 45 minutes
        });

        // Remove ordered items from cart
        cart.items = cart.items.filter(
            item => !storeItems.find(si => si.product._id.toString() === item.product._id.toString())
        );
        await cart.save();

        await order.populate([
            { path: 'store', select: 'name address contact' },
            { path: 'items.product', select: 'name images' }
        ]);

        res.status(201).json({ success: true, data: order, message: 'Order placed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private (User)
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('store', 'name address')
            .populate('deliveryPartner', 'name phone')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: orders, count: orders.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name phone email')
            .populate('store', 'name address contact')
            .populate('deliveryPartner', 'name phone')
            .populate('items.product', 'name images');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Verify access
        if (req.user.role === 'user' && order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get vendor orders
// @route   GET /api/orders/vendor/:storeId
// @access  Private (Vendor)
exports.getVendorOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const query = { store: req.params.storeId };

        if (status) query.status = status;

        const orders = await Order.find(query)
            .populate('user', 'name phone')
            .populate('deliveryPartner', 'name phone')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: orders, count: orders.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Vendor/Delivery)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, note } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.status = status;
        order.statusHistory.push({
            status,
            timestamp: Date.now(),
            note: note || `Status updated to ${status}`
        });

        if (status === 'delivered') {
            order.actualDelivery = Date.now();
        }

        await order.save();

        res.json({ success: true, data: order, message: 'Order status updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Assign delivery partner
// @route   PUT /api/orders/:id/assign-delivery
// @access  Private (Vendor)
exports.assignDeliveryPartner = async (req, res) => {
    try {
        const { deliveryPartnerId } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Verify delivery partner exists
        const deliveryPartner = await User.findOne({ _id: deliveryPartnerId, role: 'delivery' });

        if (!deliveryPartner) {
            return res.status(404).json({ success: false, message: 'Delivery partner not found' });
        }

        order.deliveryPartner = deliveryPartnerId;
        order.status = 'ready';
        order.statusHistory.push({
            status: 'ready',
            timestamp: Date.now(),
            note: 'Delivery partner assigned'
        });

        await order.save();

        res.json({ success: true, data: order, message: 'Delivery partner assigned' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get delivery partner orders
// @route   GET /api/orders/delivery/my-deliveries
// @access  Private (Delivery)
exports.getMyDeliveries = async (req, res) => {
    try {
        const { status } = req.query;
        const query = { deliveryPartner: req.user._id };

        if (status) query.status = status;

        const orders = await Order.find(query)
            .populate('user', 'name phone')
            .populate('store', 'name address contact')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: orders, count: orders.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (User)
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Verify ownership
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Can only cancel if not picked or delivered
        if (['picked', 'delivered'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel order at this stage'
            });
        }

        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }

        order.status = 'cancelled';
        order.statusHistory.push({
            status: 'cancelled',
            timestamp: Date.now(),
            note: 'Cancelled by user'
        });

        await order.save();

        res.json({ success: true, data: order, message: 'Order cancelled' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = exports;
