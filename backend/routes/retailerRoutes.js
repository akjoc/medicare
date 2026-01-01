const express = require('express');
const router = express.Router();
const retailerController = require('../controllers/retailerController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// All routes are protected and require admin role
router.route('/')
    .post(protect, admin, retailerController.createRetailer)
    .get(protect, admin, retailerController.getAllRetailers);

router.route('/:id')
    .get(protect, admin, retailerController.getRetailerById)
    .put(protect, admin, retailerController.updateRetailer)
    .delete(protect, admin, retailerController.deleteRetailer);

module.exports = router;
