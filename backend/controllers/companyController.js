const Company = require('../models/company');
const Product = require('../models/product');

// Create Company (Admin Only)
const createCompany = async (req, res) => {
    try {
        const { name, status } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Company name is required' });
        }

        const existingCompany = await Company.findOne({ where: { name } });
        if (existingCompany) {
            return res.status(400).json({ error: 'Company already exists' });
        }

        // Use provided status or default to 'active'
        const company = await Company.create({
            name,
            status: status || 'active'
        });
        res.status(201).json(company);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Companies
// Admin needs all for management.
// Retailer/Public *usually* only needs active? But for now admin usually accesses this list. 
// If specific filtering is needed for non-admins, we can add query params or check role.
// The primary use case is Admin Company Management currently.
const getAllCompanies = async (req, res) => {
    try {
        // Support simple search and paging if needed later, but starting simple
        const companies = await Company.findAll({
            order: [['name', 'ASC']]
        });
        res.status(200).json(companies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Company (Name and/or Status)
const updateCompany = async (req, res) => {
    try {
        const { name, status } = req.body;

        if (!name && !status) {
            return res.status(400).json({ error: 'Please provide name or status to update' });
        }

        const company = await Company.findByPk(req.params.id);
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        if (name) {
            // Check for duplicate name if name is changing
            if (name !== company.name) {
                const existing = await Company.findOne({ where: { name } });
                if (existing) {
                    return res.status(400).json({ error: 'Company name already in use' });
                }
                company.name = name;
            }
        }

        if (status) {
            if (!['active', 'inactive'].includes(status)) {
                return res.status(400).json({ error: 'Invalid status. Use active or inactive' });
            }
            company.status = status;
        }

        await company.save();
        res.status(200).json(company);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Toggle Company Status (Active/Inactive)
// When inactive -> Products should be hidden (handled in ProductController)
const toggleCompanyStatus = async (req, res) => {
    try {
        const company = await Company.findByPk(req.params.id);
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        const newStatus = company.status === 'active' ? 'inactive' : 'active';
        company.status = newStatus;
        await company.save();

        res.status(200).json({ message: `Company marked as ${newStatus}`, company });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Company
const deleteCompany = async (req, res) => {
    try {
        const company = await Company.findByPk(req.params.id);
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        // Check if products exist
        const productCount = await Product.count({ where: { companyId: company.id } });
        if (productCount > 0) {
            return res.status(400).json({ error: `Cannot delete company. It has ${productCount} associated products.` });
        }

        await company.destroy();
        res.status(200).json({ message: 'Company deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createCompany,
    getAllCompanies,
    updateCompany,
    toggleCompanyStatus,
    deleteCompany
};
