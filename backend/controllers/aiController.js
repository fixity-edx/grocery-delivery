const aiService = require('../services/aiService');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Generate product description
// @route   POST /api/ai/product-description
// @access  Private (Vendor)
exports.generateProductDescription = async (req, res) => {
    try {
        const { productName, name, category, features } = req.body;
        const nameToUse = productName || name || 'Product';

        const description = await aiService.generateProductDescription(nameToUse, category, features);

        res.json({ success: true, data: { description } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Generate promotion suggestions
// @route   POST /api/ai/promotion-suggestions
// @access  Private (Vendor)
exports.generatePromotionSuggestions = async (req, res) => {
    try {
        const { storeData, salesData } = req.body;

        const suggestions = await aiService.generatePromotionSuggestions(storeData, salesData);

        res.json({ success: true, data: { suggestions } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Forecast demand
// @route   POST /api/ai/forecast-demand
// @access  Private (Vendor)
exports.forecastDemand = async (req, res) => {
    try {
        const { productData, historicalSales } = req.body;

        const forecast = await aiService.forecastDemand(productData, historicalSales);

        res.json({ success: true, data: { forecast } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Optimize pricing
// @route   POST /api/ai/optimize-pricing
// @access  Private (Vendor)
exports.optimizePricing = async (req, res) => {
    try {
        const { productData, competitorPrices, salesData } = req.body;

        const optimization = await aiService.optimizePricing(productData, competitorPrices, salesData);

        res.json({ success: true, data: { optimization } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get personalized recommendations
// @route   GET /api/ai/recommendations
// @access  Private (User)
exports.getPersonalizedRecommendations = async (req, res) => {
    try {
        // Get user's purchase history
        const orders = await Order.find({ user: req.user._id })
            .populate('items.product')
            .limit(10)
            .sort({ createdAt: -1 });

        const purchaseHistory = orders.flatMap(order =>
            order.items.map(item => item.name)
        );

        const userProfile = {
            preferences: req.user.preferences || [],
            avgOrderValue: orders.reduce((sum, order) => sum + order.pricing.total, 0) / (orders.length || 1)
        };

        const recommendations = await aiService.generatePersonalizedRecommendations(userProfile, purchaseHistory);

        res.json({ success: true, data: { recommendations } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get budget optimization tips
// @route   GET /api/ai/budget-tips
// @access  Private (User)
exports.getBudgetTips = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id });

        const userSpending = {
            monthly: orders.reduce((sum, order) => sum + order.pricing.total, 0),
            avgOrder: orders.reduce((sum, order) => sum + order.pricing.total, 0) / (orders.length || 1)
        };

        const preferences = {
            categories: [...new Set(orders.flatMap(order =>
                order.items.map(item => item.product?.category).filter(Boolean)
            ))]
        };

        const tips = await aiService.generateBudgetTips(userSpending, preferences);

        res.json({ success: true, data: { tips } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Analyze fraud signals
// @route   POST /api/ai/fraud-detection
// @access  Private (Admin)
exports.analyzeFraudSignals = async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId).populate('user');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const userOrders = await Order.countDocuments({ user: order.user._id });
        const accountAge = Math.floor((Date.now() - order.user.createdAt) / (1000 * 60 * 60 * 24));

        const orderData = {
            total: order.pricing.total,
            paymentMethod: order.payment.method,
            isNewAddress: true, // Can be enhanced
            createdAt: order.createdAt
        };

        const userBehavior = {
            accountAge,
            orderCount: userOrders
        };

        const analysis = await aiService.analyzeFraudSignals(orderData, userBehavior);

        res.json({ success: true, data: { analysis } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Analyze sales trends
// @route   POST /api/ai/sales-trends
// @access  Private (Vendor/Admin)
exports.analyzeSalesTrends = async (req, res) => {
    try {
        const { storeId, period } = req.body;

        const query = { status: 'delivered' };
        if (storeId) query.store = storeId;

        const orders = await Order.find(query).populate('items.product');

        const salesData = {
            total: orders.reduce((sum, order) => sum + order.pricing.total, 0),
            orderCount: orders.length,
            avgOrderValue: orders.reduce((sum, order) => sum + order.pricing.total, 0) / (orders.length || 1),
            topProducts: [...new Set(orders.flatMap(order => order.items.map(item => item.name)))].slice(0, 5),
            growthRate: 15 // Can be calculated based on historical data
        };

        const analysis = await aiService.analyzeSalesTrends(salesData, period || 'monthly');

        res.json({ success: true, data: { analysis } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Analyze store performance
// @route   POST /api/ai/store-performance
// @access  Private (Vendor)
exports.analyzeStorePerformance = async (req, res) => {
    try {
        const { storeId } = req.body;

        const orders = await Order.find({ store: storeId, status: 'delivered' });

        const storeMetrics = {
            name: 'Store Name', // Get from store
            revenue: orders.reduce((sum, order) => sum + order.pricing.total, 0),
            orders: orders.length,
            rating: 4.5, // Get from store
            avgDeliveryTime: 35, // Calculate from orders
            retentionRate: 75 // Calculate from user data
        };

        const analysis = await aiService.analyzeStorePerformance(storeMetrics);

        res.json({ success: true, data: { analysis } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = exports;
