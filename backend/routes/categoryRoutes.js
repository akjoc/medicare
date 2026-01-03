const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// Public Route
router.get('/', protect, categoryController.getAllCategories);
router.get('/:id', protect, categoryController.getCategoryById);

// Admin Routes
router.post('/', protect, admin, categoryController.createCategory);
router.put('/:id', protect, admin, categoryController.updateCategory);
router.delete('/:id', protect, admin, categoryController.deleteCategory);

module.exports = router;
