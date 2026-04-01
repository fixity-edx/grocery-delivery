const Product = require('../models/Product');
const Store = require('../models/Store');
const aiService = require('../services/aiService');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
    try {
        const { category, store, search, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

        const query = { isAvailable: true };

        if (category) query.category = category;
        if (store) query.store = store;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const products = await Product.find(query)
            .populate('store', 'name address rating')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Product.countDocuments(query);

        res.json({
            success: true,
            data: products,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('store', 'name address contact rating');

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create product (Vendor only)
// @route   POST /api/products
// @access  Private (Vendor)
exports.createProduct = async (req, res) => {
    try {
        const { name, description, category, subCategory, brand, price, unit, stock, storeId, images, tags } = req.body;

        // Verify store ownership
        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        if (store.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to add products to this store' });
        }

        const product = await Product.create({
            name,
            description,
            category,
            subCategory,
            brand,
            price,
            unit,
            stock,
            store: storeId,
            images: images || [],
            tags: tags || []
        });

        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update product (Vendor only)
// @route   PUT /api/products/:id
// @access  Private (Vendor)
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('store');

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Verify ownership
        if (product.store.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({ success: true, data: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete product (Vendor only)
// @route   DELETE /api/products/:id
// @access  Private (Vendor)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('store');

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Verify ownership
        if (product.store.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await product.deleteOne();

        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Generate AI product description
// @route   POST /api/products/ai-description
// @access  Private (Vendor)
exports.generateAIDescription = async (req, res) => {
    try {
        const { productName, name, category, features } = req.body;
        const nameToUse = productName || name || 'Product';

        const description = await aiService.generateProductDescription(nameToUse, category, features);

        res.json({ success: true, data: { description } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get products by store
// @route   GET /api/products/store/:storeId
// @access  Public
exports.getProductsByStore = async (req, res) => {
    try {
        const query = { store: req.params.storeId };

        // If not a vendor request (basic check), maybe we should filter?
        // But for now, returning all and letting frontend filter is easiest fix for the mixed use case
        // without adding new routes.

        const products = await Product.find(query).sort({ createdAt: -1 });

        res.json({ success: true, data: products, count: products.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get low stock products (Vendor only)
// @route   GET /api/products/low-stock/:storeId
// @access  Private (Vendor)
exports.getLowStockProducts = async (req, res) => {
    try {
        const store = await Store.findById(req.params.storeId);

        if (!store) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        if (store.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const products = await Product.find({
            store: req.params.storeId,
            $expr: { $lte: ['$stock', '$lowStockThreshold'] }
        });

        res.json({ success: true, data: products, count: products.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
