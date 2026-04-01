const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Store = require('../models/Store');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalVendors = await User.countDocuments({ role: 'vendor' });
        const totalDeliveryPartners = await User.countDocuments({ role: 'delivery' });
        const totalStores = await Store.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const pendingStoreApprovals = await Store.countDocuments({ isApproved: false });

        const revenueData = await Order.aggregate([
            { $match: { status: 'delivered' } },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$pricing.total' },
                    commission: { $sum: { $multiply: ['$pricing.total', 0.1] } }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                users: totalUsers,
                vendors: totalVendors,
                deliveryPartners: totalDeliveryPartners,
                stores: totalStores,
                products: totalProducts,
                orders: totalOrders,
                pendingApprovals: pendingStoreApprovals,
                revenue: revenueData[0]?.total || 0,
                commission: revenueData[0]?.commission || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
router.get('/users', protect, authorize('admin'), async (req, res) => {
    try {
        const { role, search } = req.query;
        const query = {};

        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });

        res.json({ success: true, data: users, count: users.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin)
router.put('/users/:id/toggle-status', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({ success: true, data: user, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get pending store approvals
// @route   GET /api/admin/stores/pending
// @access  Private (Admin)
router.get('/stores/pending', protect, authorize('admin'), async (req, res) => {
    try {
        const stores = await Store.find({ isApproved: false })
            .populate('owner', 'name email phone')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: stores, count: stores.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Approve/reject store
// @route   PUT /api/admin/stores/:id/approve
// @access  Private (Admin)
router.put('/stores/:id/approve', protect, authorize('admin'), async (req, res) => {
    try {
        const { approved } = req.body;

        const store = await Store.findByIdAndUpdate(
            req.params.id,
            { isApproved: approved },
            { new: true }
        );

        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        res.json({
            success: true,
            data: store,
            message: `Store ${approved ? 'approved' : 'rejected'}`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Private (Admin)
router.get('/orders', protect, authorize('admin'), async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};

        if (status) query.status = status;

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .populate('store', 'name')
            .populate('deliveryPartner', 'name')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Order.countDocuments(query);

        res.json({
            success: true,
            data: orders,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
