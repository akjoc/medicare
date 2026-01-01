const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/me', protect, userController.getMe);
router.post('/logout', protect, userController.logoutUser);
router.get('/', protect, userController.getAllUsers);

module.exports = router;
