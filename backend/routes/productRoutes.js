const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { upload } = require('../config/cloudinaryConfig');

// Public Route
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin Routes
router.post('/', protect, admin, upload.single('image'), productController.createProduct);
router.put('/:id', protect, admin, upload.single('image'), productController.updateProduct);
router.delete('/:id', protect, admin, productController.deleteProduct);

module.exports = router;
