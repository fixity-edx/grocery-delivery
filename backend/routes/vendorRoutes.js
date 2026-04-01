const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Placeholder for vendor-specific routes
// Most vendor functionality is in stores and products routes

router.get('/dashboard', protect, authorize('vendor'), (req, res) => {
    res.json({ success: true, message: 'Vendor dashboard endpoint' });
});

module.exports = router;
