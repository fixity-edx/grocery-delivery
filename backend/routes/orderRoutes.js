const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    createOrder,
    getMyOrders,
    getOrder,
    getVendorOrders,
    updateOrderStatus,
    assignDeliveryPartner,
    getMyDeliveries,
    cancelOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// Validation
const createOrderValidation = [
    body('storeId').notEmpty().withMessage('Store ID is required'),
    body('deliveryAddress').notEmpty().withMessage('Delivery address is required'),
    body('paymentMethod').isIn(['COD', 'Card', 'UPI', 'Wallet']).withMessage('Invalid payment method')
];

// User routes
router.post('/', protect, authorize('user'), createOrderValidation, validate, createOrder);
router.get('/my-orders', protect, authorize('user'), getMyOrders);
router.put('/:id/cancel', protect, authorize('user'), cancelOrder);

// Vendor routes
router.get('/vendor/:storeId', protect, authorize('vendor'), getVendorOrders);
router.put('/:id/assign-delivery', protect, authorize('vendor'), assignDeliveryPartner);

// Delivery routes
router.get('/delivery/my-deliveries', protect, authorize('delivery'), getMyDeliveries);

// Shared routes
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('vendor', 'delivery'), updateOrderStatus);

module.exports = router;
