const express = require('express');
const router = express.Router();
const paymentConfigController = require('../controllers/paymentConfigController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { upload } = require('../config/cloudinaryConfig');

// Public or Retailer route (Depending on if you want it strictly protected)
// The user request implies "on the retailer side create a api", usually this means protected by retailer auth,
// but for configuration like this it is often public or just protected by general auth.
// I will use 'protect' to ensure only logged in users (retailers/admins) can see it, unless requirements say otherwise.
// Actually, for "retailer side", they are logged in users.
router.get('/retailer', protect, paymentConfigController.getRetailerPaymentConfig);

// Admin Routes
router.get('/', protect, admin, paymentConfigController.getPaymentConfig);
router.put('/', protect, admin, upload.single('qrCodeImage'), paymentConfigController.updatePaymentConfig);

module.exports = router;
