const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Store = require('../models/Store');

// @desc    Get platform analytics (Admin)
// @route   GET /api/analytics/platform
// @access  Private (Admin)
router.get('/platform', protect, authorize('admin'), async (req, res) => {
    try {
        const { period = 'month' } = req.query;

        // Calculate date range
        const now = new Date();
        let startDate;

        if (period === 'week') {
            startDate = new Date(now.setDate(now.getDate() - 7));
        } else if (period === 'month') {
            startDate = new Date(now.setMonth(now.getMonth() - 1));
        } else {
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        }

        const orders = await Order.find({
            createdAt: { $gte: startDate },
            status: 'delivered'
        });

        const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.total, 0);
        const totalCommission = totalRevenue * 0.1; // 10% commission

        const analytics = {
            period,
            totalOrders: orders.length,
            totalRevenue,
            platformCommission: totalCommission,
            averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
            topStores: await getTopStores(startDate),
            topProducts: await getTopProducts(startDate),
            ordersByStatus: await getOrdersByStatus(startDate)
        };

        res.json({ success: true, data: analytics });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get store analytics (Vendor)
// @route   GET /api/analytics/store/:storeId
// @access  Private (Vendor)
router.get('/store/:storeId', protect, authorize('vendor'), async (req, res) => {
    try {
        const { period = 'month' } = req.query;

        // Verify store ownership
        const store = await Store.findById(req.params.storeId);
        if (!store || store.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const now = new Date();
        let startDate;

        if (period === 'week') {
            startDate = new Date(now.setDate(now.getDate() - 7));
        } else if (period === 'month') {
            startDate = new Date(now.setMonth(now.getMonth() - 1));
        } else {
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        }

        const orders = await Order.find({
            store: req.params.storeId,
            createdAt: { $gte: startDate },
            status: 'delivered'
        }).populate('items.product');

        const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.total, 0);
        const commission = totalRevenue * (store.commission / 100);

        // Get product performance
        const productSales = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                const productId = item.product?._id?.toString();
                if (productId) {
                    if (!productSales[productId]) {
                        productSales[productId] = {
                            name: item.name,
                            quantity: 0,
                            revenue: 0
                        };
                    }
                    productSales[productId].quantity += item.quantity;
                    productSales[productId].revenue += item.subtotal;
                }
            });
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        const analytics = {
            period,
            totalOrders: orders.length,
            totalRevenue,
            platformCommission: commission,
            netRevenue: totalRevenue - commission,
            averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
            topProducts,
            totalProducts: await Product.countDocuments({ store: req.params.storeId }),
            lowStockProducts: await Product.countDocuments({
                store: req.params.storeId,
                $expr: { $lte: ['$stock', '$lowStockThreshold'] }
            })
        };

        res.json({ success: true, data: analytics });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Helper functions
async function getTopStores(startDate) {
    const result = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                status: 'delivered'
            }
        },
        {
            $group: {
                _id: '$store',
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$pricing.total' }
            }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'stores',
                localField: '_id',
                foreignField: '_id',
                as: 'store'
            }
        },
        { $unwind: '$store' },
        {
            $project: {
                name: '$store.name',
                totalOrders: 1,
                totalRevenue: 1
            }
        }
    ]);

    return result;
}

async function getTopProducts(startDate) {
    const result = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                status: 'delivered'
            }
        },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.product',
                name: { $first: '$items.name' },
                totalQuantity: { $sum: '$items.quantity' },
                totalRevenue: { $sum: '$items.subtotal' }
            }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 }
    ]);

    return result;
}

async function getOrdersByStatus(startDate) {
    const result = await Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    return result;
}

module.exports = router;
