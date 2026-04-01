const express = require('express');
const router = express.Router();
const {
    generateProductDescription,
    generatePromotionSuggestions,
    forecastDemand,
    optimizePricing,
    getPersonalizedRecommendations,
    getBudgetTips,
    analyzeFraudSignals,
    analyzeSalesTrends,
    analyzeStorePerformance
} = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Vendor AI features
router.post('/product-description', protect, authorize('vendor'), generateProductDescription);
router.post('/promotion-suggestions', protect, authorize('vendor'), generatePromotionSuggestions);
router.post('/forecast-demand', protect, authorize('vendor'), forecastDemand);
router.post('/optimize-pricing', protect, authorize('vendor'), optimizePricing);
router.post('/sales-trends', protect, authorize('vendor', 'admin'), analyzeSalesTrends);
router.post('/store-performance', protect, authorize('vendor'), analyzeStorePerformance);

// User AI features
router.get('/recommendations', protect, authorize('user'), getPersonalizedRecommendations);
router.get('/budget-tips', protect, authorize('user'), getBudgetTips);

// Admin AI features
router.post('/fraud-detection', protect, authorize('admin'), analyzeFraudSignals);

module.exports = router;
