const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Promotion = require('../models/Promotion');

// @desc    Get all promotions
// @route   GET /api/promotions
// @access  Public
router.get('/', async (req, res) => {
    try {
        const now = new Date();
        const promotions = await Promotion.find({
            isActive: true,
            validFrom: { $lte: now },
            validUntil: { $gte: now }
        }).populate('applicableStores', 'name');

        res.json({ success: true, data: promotions, count: promotions.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get single promotion
// @route   GET /api/promotions/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id)
            .populate('applicableStores', 'name')
            .populate('applicableProducts', 'name price');

        if (!promotion) {
            return res.status(404).json({ success: false, message: 'Promotion not found' });
        }

        res.json({ success: true, data: promotion });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Validate promotion code
// @route   POST /api/promotions/validate
// @access  Private
router.post('/validate', protect, async (req, res) => {
    try {
        const { code, orderAmount, storeId } = req.body;

        const promotion = await Promotion.findOne({
            code: code.toUpperCase(),
            isActive: true,
            validFrom: { $lte: new Date() },
            validUntil: { $gte: new Date() }
        });

        if (!promotion) {
            return res.status(404).json({ success: false, message: 'Invalid or expired promotion code' });
        }

        // Check minimum order amount
        if (orderAmount < promotion.minOrderAmount) {
            return res.status(400).json({
                success: false,
                message: `Minimum order amount is ₹${promotion.minOrderAmount}`
            });
        }

        // Check store applicability
        if (promotion.applicableStores.length > 0 && !promotion.applicableStores.includes(storeId)) {
            return res.status(400).json({
                success: false,
                message: 'Promotion not applicable for this store'
            });
        }

        // Check usage limit
        if (promotion.usageLimit?.total && promotion.usageCount >= promotion.usageLimit.total) {
            return res.status(400).json({ success: false, message: 'Promotion usage limit reached' });
        }

        // Calculate discount
        let discount = 0;
        if (promotion.type === 'percentage') {
            discount = (orderAmount * promotion.value) / 100;
            if (promotion.maxDiscount) {
                discount = Math.min(discount, promotion.maxDiscount);
            }
        } else if (promotion.type === 'fixed') {
            discount = promotion.value;
        }

        res.json({
            success: true,
            data: {
                promotion,
                discount,
                finalAmount: orderAmount - discount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Create promotion (Vendor/Admin)
// @route   POST /api/promotions
// @access  Private (Vendor/Admin)
router.post('/', protect, authorize('vendor', 'admin'), async (req, res) => {
    try {
        const promotionData = {
            ...req.body,
            createdBy: req.user._id,
            isGlobal: req.user.role === 'admin'
        };

        const promotion = await Promotion.create(promotionData);

        res.status(201).json({ success: true, data: promotion });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Update promotion
// @route   PUT /api/promotions/:id
// @access  Private (Vendor/Admin)
router.put('/:id', protect, authorize('vendor', 'admin'), async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id);

        if (!promotion) {
            return res.status(404).json({ success: false, message: 'Promotion not found' });
        }

        // Verify ownership (vendors can only edit their own promotions)
        if (req.user.role === 'vendor' && promotion.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updatedPromotion = await Promotion.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({ success: true, data: updatedPromotion });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Delete promotion
// @route   DELETE /api/promotions/:id
// @access  Private (Vendor/Admin)
router.delete('/:id', protect, authorize('vendor', 'admin'), async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id);

        if (!promotion) {
            return res.status(404).json({ success: false, message: 'Promotion not found' });
        }

        // Verify ownership
        if (req.user.role === 'vendor' && promotion.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await promotion.deleteOne();

        res.json({ success: true, message: 'Promotion deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
