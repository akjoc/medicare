const Retailer = require('../models/retailer');
const User = require('../models/user');
const Category = require('../models/category');

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
            gst,
            rating,
            password,
            categoryIds // Array of Category IDs
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

        if (drugLicenseNumber) {
            const licenseExists = await Retailer.findOne({
                where: {
                    drugLicenseNumber: drugLicenseNumber
                }
            });

            if (licenseExists) {
                return res.status(400).json({ error: 'Retailer already exists with this License Number' });
            }
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
            gst,
            rating,
            UserId: user.id
        });

        // 3. Assign Categories if provided
        if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
            await retailer.setCategories(categoryIds);
        }

        res.status(201).json(retailer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const { Op } = require('sequelize');

// Get all retailers
const getAllRetailers = async (req, res) => {
    try {
        const { search } = req.query;
        let whereClause = {};

        if (search) {
            whereClause = {
                [Op.or]: [
                    { shopName: { [Op.like]: `%${search}%` } },
                    { ownerName: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                    { phone: { [Op.like]: `%${search}%` } },
                    { city: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const retailers = await Retailer.findAll({
            where: whereClause,
            include: [{
                model: Category,
                attributes: ['id'],
                through: { attributes: [] }
            }]
        });

        const result = retailers.map(retailer => {
            const plain = retailer.get({ plain: true });
            plain.categoryIds = plain.Categories ? plain.Categories.map(c => c.id) : [];
            delete plain.Categories;
            return plain;
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get retailer by ID
const getRetailerById = async (req, res) => {
    try {
        const retailer = await Retailer.findByPk(req.params.id, {
            include: [{
                model: Category,
                attributes: ['id'],
                through: { attributes: [] }
            }]
        });

        if (retailer) {
            const plain = retailer.get({ plain: true });
            plain.categoryIds = plain.Categories ? plain.Categories.map(c => c.id) : [];
            delete plain.Categories;
            res.status(200).json(plain);
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
            // Handle Password Update (if provided)
            if (req.body.password) {
                const user = await User.findByPk(retailer.UserId);
                if (user) {
                    user.password = req.body.password; // Hook will hash it
                    await user.save();
                }
            }

            // Check if email is being updated and if it's already taken by ANY user (Admin, other Retailer, etc.)
            if (req.body.email) {
                const userExists = await User.findOne({
                    where: { email: req.body.email }
                });

                // If a user exists with this email AND it's not the user account linked to this retailer
                if (userExists && userExists.id !== retailer.UserId) {
                    return res.status(400).json({ error: 'Email already in use by another account' });
                }

                // If valid, we must also update the User's email
                const user = await User.findByPk(retailer.UserId);
                if (user && user.email !== req.body.email) {
                    user.email = req.body.email;
                    await user.save();
                }
            }

            // Check if License Number is being updated and is already taken
            if (req.body.drugLicenseNumber) {
                const licenseExists = await Retailer.findOne({
                    where: { drugLicenseNumber: req.body.drugLicenseNumber }
                });
                if (licenseExists && licenseExists.id !== retailer.id) {
                    return res.status(400).json({ error: 'Retailer already exists with this License Number' });
                }
            }

            // check duplicate email/license logic should optimally be here too if those fields change
            await retailer.update(req.body);

            // Update categories if provided
            if (req.body.categoryIds && Array.isArray(req.body.categoryIds)) {
                await retailer.setCategories(req.body.categoryIds);
            }

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
