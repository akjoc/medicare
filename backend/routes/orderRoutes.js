const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getCheckoutSummary, placeOrder, getUserOrders, getAllOrders } = require('../controllers/orderController');

// Calculate bill before placing order
router.post('/checkout-summary', protect, getCheckoutSummary);

// Place final order
router.post('/place', protect, placeOrder);

// Get User Orders
router.get('/', protect, getUserOrders);

// Get All Orders (Admin)
router.get('/all', protect, getAllOrders); // Add admin middleware if needed later

module.exports = router;
