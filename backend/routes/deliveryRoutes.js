const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Order = require('../models/Order');

// @desc    Get delivery partner dashboard
// @route   GET /api/delivery/dashboard
// @access  Private (Delivery)
router.get('/dashboard', protect, authorize('delivery'), async (req, res) => {
    try {
        const totalDeliveries = await Order.countDocuments({
            deliveryPartner: req.user._id,
            status: 'delivered'
        });

        const pendingDeliveries = await Order.countDocuments({
            deliveryPartner: req.user._id,
            status: { $in: ['ready', 'picked'] }
        });

        const todayDeliveries = await Order.countDocuments({
            deliveryPartner: req.user._id,
            status: 'delivered',
            actualDelivery: { $gte: new Date().setHours(0, 0, 0, 0) }
        });

        const earnings = await Order.aggregate([
            {
                $match: {
                    deliveryPartner: req.user._id,
                    status: 'delivered'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$pricing.deliveryFee' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                totalDeliveries,
                pendingDeliveries,
                todayDeliveries,
                totalEarnings: earnings[0]?.total || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
