const express = require('express');
const router = express.Router();
const appSettingController = require('../controllers/appSettingController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// Public Route (for app tagline/name on login screen etc)
// If you want to protect it for logged in users only, use 'protect'. 
// But "Visible on the login screen" implies it should be public.
router.get('/', appSettingController.getAppSettings);

// Admin Route
router.put('/', protect, admin, appSettingController.updateAppSettings);

module.exports = router;
