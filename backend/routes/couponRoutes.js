const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { retailer } = require('../middleware/retailerMiddleware');

// Admin Routes
router.post('/', protect, admin, couponController.createCoupon);
router.get('/', protect, admin, couponController.getAllCoupons);
router.put('/:id', protect, admin, couponController.updateCoupon);
router.patch('/:id/status', protect, admin, couponController.toggleCouponStatus);
router.delete('/:id', protect, admin, couponController.deleteCoupon);

// Retailer Routes
router.post('/apply', protect, retailer, couponController.applyCoupon);

module.exports = router;
