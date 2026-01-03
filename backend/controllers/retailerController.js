const Retailer = require('../models/retailer');
const User = require('../models/user');

// Create a new retailer
const createRetailer = async (req, res) => {
    try {
        const {
            shopName,
            ownerName,
            email,
            phone,
            address,
            city,
            state,
            zipCode,
            drugLicenseNumber,
            password
        } = req.body;

        // Check availability
        const retailerExists = await Retailer.findOne({
            where: {
                email: email
            }
        });

        if (retailerExists) {
            return res.status(400).json({ error: 'Retailer already exists with this email' });
        }

        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        const licenseExists = await Retailer.findOne({
            where: {
                drugLicenseNumber: drugLicenseNumber
            }
        });

        if (licenseExists) {
            return res.status(400).json({ error: 'Retailer already exists with this License Number' });
        }

        // 1. Create User Account
        const user = await User.create({
            name: ownerName,
            email: email,
            password: password,
            role: 'retailer'
        });

        // 2. Create Retailer Profile linked to User
        const retailer = await Retailer.create({
            shopName,
            ownerName,
            email,
            phone,
            address,
            city,
            state,
            zipCode,
            drugLicenseNumber,
            UserId: user.id
        });

        res.status(201).json(retailer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all retailers
const getAllRetailers = async (req, res) => {
    try {
        const retailers = await Retailer.findAll();
        res.status(200).json(retailers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get retailer by ID
const getRetailerById = async (req, res) => {
    try {
        const retailer = await Retailer.findByPk(req.params.id);
        if (retailer) {
            res.status(200).json(retailer);
        } else {
            res.status(404).json({ error: 'Retailer not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update retailer
const updateRetailer = async (req, res) => {
    try {
        const retailer = await Retailer.findByPk(req.params.id);

        if (retailer) {
            await retailer.update(req.body);
            res.status(200).json(retailer);
        } else {
            res.status(404).json({ error: 'Retailer not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete retailer
const deleteRetailer = async (req, res) => {
    try {
        const retailer = await Retailer.findByPk(req.params.id);

        if (retailer) {
            // Also delete the associated User account
            const userId = retailer.UserId;
            await retailer.destroy();
            await User.destroy({ where: { id: userId } });
            res.status(200).json({ message: 'Retailer and associated User account removed' });
        } else {
            res.status(404).json({ error: 'Retailer not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createRetailer,
    getAllRetailers,
    getRetailerById,
    updateRetailer,
    deleteRetailer
};
