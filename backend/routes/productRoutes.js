const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    getAllProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    generateAIDescription,
    getProductsByStore,
    getLowStockProducts
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// Validation
const productValidation = [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('unit').isIn(['kg', 'g', 'l', 'ml', 'piece', 'dozen', 'pack', '1kg', '500g', '250g', '1L', '500ml', '1pc', '1dz']).withMessage('Invalid unit'),
    body('stock').isNumeric().withMessage('Stock must be a number'),
    body('storeId').notEmpty().withMessage('Store ID is required')
];

// Public routes
router.get('/', getAllProducts);
router.get('/store/:storeId', getProductsByStore);
router.get('/:id', getProduct);

// Vendor routes
router.post('/', protect, authorize('vendor'), productValidation, validate, createProduct);
router.put('/:id', protect, authorize('vendor'), updateProduct);
router.delete('/:id', protect, authorize('vendor'), deleteProduct);
router.post('/ai-description', protect, authorize('vendor'), generateAIDescription);
router.get('/low-stock/:storeId', protect, authorize('vendor'), getLowStockProducts);

module.exports = router;
