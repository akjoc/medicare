const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const {
    createCompany,
    getAllCompanies,
    updateCompany,
    toggleCompanyStatus,
    deleteCompany
} = require('../controllers/companyController');

// All company management routes should be protected and admin-only
router.post('/', protect, admin, createCompany);
router.get('/', protect, admin, getAllCompanies); // Or open if needed for search
router.put('/:id', protect, admin, updateCompany);
router.put('/:id/status', protect, admin, toggleCompanyStatus);
router.delete('/:id', protect, admin, deleteCompany);

module.exports = router;
