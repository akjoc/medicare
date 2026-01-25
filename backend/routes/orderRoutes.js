const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { uploadInvoice: uploadInvoiceMiddleware } = require('../config/fileUploadConfig');

const {
    getCheckoutSummary,
    placeOrder,
    getUserOrders,
    getAllOrders,
    getRetailerOrders,
    getOrderById,
    updatePaymentStatus,
    updateOrderStatus,
    uploadInvoice: uploadInvoiceController,
    rateOrder
} = require('../controllers/orderController');

// Calculate bill before placing order
router.post('/checkout-summary', protect, getCheckoutSummary);

// Place final order
router.post('/place', protect, placeOrder);

// Get User Orders
router.get('/', protect, getUserOrders);

// Get All Orders (Admin)
router.get('/all', protect, getAllOrders);

// Upload Invoice (Admin)
router.post('/:id/invoice', protect, admin, uploadInvoiceMiddleware.single('invoice'), uploadInvoiceController);

// Get Orders for specific Retailer (Admin)
router.get('/retailer/:retailerId', protect, admin, getRetailerOrders);

// Update Payment Status (Admin)
router.put('/:id/payment-status', protect, admin, updatePaymentStatus);

// Update Order Status (Admin)
router.put('/:id/status', protect, admin, updateOrderStatus);

// Rate Order (Admin)
router.put('/:id/rate', protect, admin, rateOrder);

// Get Order By ID (Must be last to avoid matching conflicts)
router.get('/:id', protect, getOrderById);

module.exports = router;
