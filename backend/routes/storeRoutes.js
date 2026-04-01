const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    getAllStores,
    getStore,
    createStore,
    updateStore,
    deleteStore,
    getMyStores,
    getNearbyStores
} = require('../controllers/storeController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// Validation
const storeValidation = [
    body('name').trim().notEmpty().withMessage('Store name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('address.street').notEmpty().withMessage('Street address is required'),
    body('address.city').notEmpty().withMessage('City is required'),
    body('address.pincode').notEmpty().withMessage('Pincode is required'),
    body('contact.phone').notEmpty().withMessage('Phone number is required')
];

// Public routes
router.get('/', getAllStores);
router.get('/nearby', getNearbyStores);
router.get('/:id', getStore);

// Vendor routes
router.post('/', protect, authorize('vendor'), storeValidation, validate, createStore);
router.put('/:id', protect, authorize('vendor'), updateStore);
router.delete('/:id', protect, authorize('vendor'), deleteStore);
router.get('/vendor/my-stores', protect, authorize('vendor'), getMyStores);

module.exports = router;
