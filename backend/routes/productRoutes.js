const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { upload } = require('../config/cloudinaryConfig');
const { uploadFile } = require('../config/fileUploadConfig');

// Public Route
router.get('/', protect, productController.getAllProducts);
router.get('/:id', protect, productController.getProductById);

// Admin Routes
router.post('/bulk-upload', protect, admin, uploadFile.single('file'), productController.bulkUploadProducts);
router.post('/', protect, admin, upload.single('image'), productController.createProduct);
router.put('/:id', protect, admin, upload.single('image'), productController.updateProduct);
router.delete('/delete-all', protect, admin, productController.deleteAllProducts);
router.delete('/:id', protect, admin, productController.deleteProduct);

module.exports = router;
