const User = require('../models/user');
const Retailer = require('../models/retailer');
const Blacklist = require('../models/blacklist');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// Create a new user (Register)
const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password' });
        }

        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const user = await User.create({ name, email, password });

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (user && (await user.matchPassword(password))) {
            let responseData = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id),
                ...user.get({ plain: true }) // Include all user fields
            };

            // Remove sensitive data
            delete responseData.password;

            // Ensure token is not overwritten/deleted if user model has 'token' field (unlikely but safe)
            responseData.token = generateToken(user.id);

            if (user.role === 'retailer') {
                const retailer = await Retailer.findOne({ where: { UserId: user.id } });
                if (retailer) {
                    const retailerData = retailer.get({ plain: true });
                    // Merge retailer data, but avoid overwriting user id/email if possible, or just standard spread
                    responseData = { ...responseData, ...retailerData, id: user.id, email: user.email }; // Ensure critical user fields take precedence or use separate object? 
                    // User requested "give retailer name, shop name etc all data". 
                    // Merging at top level is requested.
                    // Note: Retailer has 'id' too. This might overwrite User 'id' if not careful.
                    // Let's keep User ID as 'userId' or 'id'? 
                    // Usually better to nest, but user asked for "whole data". 
                    // Let's add specific fields to avoid ID collision or explicit "retailerDetails" object?
                    // "if retailer is logged in then give retailer name, shop name etc all data"
                    // I will provide a merged structure but explicit about IDs.

                    responseData = {
                        ...responseData,
                        retailerId: retailer.id,
                        shopName: retailer.shopName,
                        ownerName: retailer.ownerName,
                        phone: retailer.phone,
                        address: retailer.address,
                        city: retailer.city,
                        state: retailer.state,
                        zipCode: retailer.zipCode,
                        drugLicenseNumber: retailer.drugLicenseNumber,
                        gst: retailer.gst,
                        rating: retailer.rating,
                        status: retailer.status,
                        isActive: retailer.isActive
                    };
                }
            }

            res.json(responseData);
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get current user
const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

// Logout user
const logoutUser = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        await Blacklist.create({
            token: token,
            expiresAt: new Date(decoded.exp * 1000)
        });

        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Change Password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify Current Password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect current password' });
        }

        // Validate New Password
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'New password and confirm password do not match' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Update Password (Sequelize hook should handle hashing)
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createUser,
    getAllUsers,
    loginUser,
    getMe,
    logoutUser,
    changePassword
};
