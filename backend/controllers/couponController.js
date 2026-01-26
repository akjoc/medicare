const Coupon = require('../models/coupon');
const { Op } = require('sequelize');

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
    try {
        const {
            code,
            type,
            value,
            description,
            shortDescription,
            usageLimit,
            categoryIds,
            retailerIds,
            isActive
        } = req.body;

        // Validation for mandatory fields
        if (!code || !type || !value) {
            return res.status(400).json({ error: 'Code, type, and value are required' });
        }

        const couponExists = await Coupon.findOne({ where: { code: code.toUpperCase() } });
        if (couponExists) {
            return res.status(400).json({ error: 'Coupon code already exists' });
        }

        const coupon = await Coupon.create({
            code,
            type,
            value,
            description,
            shortDescription,
            usageLimit, // Optional
            categoryIds: categoryIds || [],
            retailerIds: retailerIds || [],
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json(coupon);
    } catch (error) {
        console.error('Create Coupon Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getAllCoupons = async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const limit = 20;
        // const limit = 1;
        const offset = (page - 1) * limit;

        const { count, rows } = await Coupon.findAndCountAll({
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            coupons: rows,
            totalCoupons: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Get Coupons Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByPk(req.params.id);

        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        const {
            code,
            type,
            value,
            description,
            shortDescription,
            usageLimit,
            categoryIds,
            retailerIds,
            isActive
        } = req.body;

        // If code is being updated, check uniqueness
        if (code && code.toUpperCase() !== coupon.code) {
            const couponExists = await Coupon.findOne({ where: { code: code.toUpperCase() } });
            if (couponExists) {
                return res.status(400).json({ error: 'Coupon code already exists' });
            }
        }

        coupon.code = code || coupon.code;
        coupon.type = type || coupon.type;
        coupon.value = value !== undefined ? value : coupon.value;
        coupon.description = description !== undefined ? description : coupon.description;
        coupon.shortDescription = shortDescription !== undefined ? shortDescription : coupon.shortDescription;
        coupon.usageLimit = usageLimit !== undefined ? usageLimit : coupon.usageLimit;
        coupon.categoryIds = categoryIds !== undefined ? categoryIds : coupon.categoryIds;
        coupon.retailerIds = retailerIds !== undefined ? retailerIds : coupon.retailerIds;

        if (isActive !== undefined) {
            coupon.isActive = isActive;
        }

        await coupon.save();
        res.json(coupon);
    } catch (error) {
        console.error('Update Coupon Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Toggle coupon status
// @route   PATCH /api/coupons/:id/status
// @access  Private/Admin
const toggleCouponStatus = async (req, res) => {
    try {
        const coupon = await Coupon.findByPk(req.params.id);

        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        coupon.isActive = !coupon.isActive;
        await coupon.save();

        res.json({ message: `Coupon is now ${coupon.isActive ? 'active' : 'inactive'}`, coupon });
    } catch (error) {
        console.error('Toggle Coupon Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Apply a coupon
// @route   POST /api/coupons/apply
// @access  Private/Retailer
const applyCoupon = async (req, res) => {
    try {
        const { code, orderValue, retailerId, cartItems } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Coupon code is required' });
        }

        const coupon = await Coupon.findOne({ where: { code: code.toUpperCase() } });

        if (!coupon) {
            return res.status(404).json({ error: 'Invalid coupon code' });
        }

        if (!coupon.isActive) {
            return res.status(400).json({ error: 'Coupon is inactive' });
        }

        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return res.status(400).json({ error: 'Coupon usage limit reached' });
        }

        const allowedRetailers = Array.isArray(coupon.retailerIds) ? coupon.retailerIds : JSON.parse(coupon.retailerIds || '[]');

        // Retailer Restriction Check
        if (retailerId && allowedRetailers.length > 0) {
            const isRetailerAllowed = allowedRetailers.some(id => String(id) === String(retailerId));
            if (!isRetailerAllowed) {
                return res.status(400).json({ error: 'This coupon is not valid for your account' });
            }
        }

        // Calculate Eligible Subtotal
        let eligibleSubtotal = orderValue;
        const allowedCategories = Array.isArray(coupon.categoryIds) ? coupon.categoryIds : JSON.parse(coupon.categoryIds || '[]');

        if (allowedCategories.length > 0) {
            if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
                return res.status(400).json({ error: 'This coupon requires cart details to calculate category-specific discounts' });
            }

            eligibleSubtotal = cartItems.reduce((acc, item) => {
                // item.categoryId can be a single ID or an array of IDs
                const itemCategoryIds = Array.isArray(item.categoryId) ? item.categoryId : [item.categoryId];
                const isEligible = itemCategoryIds.some(itemCatId =>
                    allowedCategories.some(allowedCatId => String(allowedCatId) === String(itemCatId))
                );

                if (isEligible) {
                    // Use salePrice if available, otherwise use price
                    const itemPrice = (item.salePrice !== undefined && item.salePrice !== null) ? item.salePrice : item.price;
                    return acc + (Number(itemPrice) * (Number(item.quantity) || 1));
                }
                return acc;
            }, 0);

            if (eligibleSubtotal === 0) {
                return res.status(400).json({ error: 'This coupon is not applicable to any items in your cart' });
            }
        }

        // Calculate Discount
        let discountAmount = 0;
        if (coupon.type === 'flat') {
            discountAmount = coupon.value;
        } else if (coupon.type === 'percent') {
            discountAmount = (eligibleSubtotal * coupon.value) / 100;
        }

        // Ensure discount doesn't exceed eligible subtotal
        if (discountAmount > eligibleSubtotal) {
            discountAmount = eligibleSubtotal;
        }

        res.json({
            success: true,
            code: coupon.code,
            discountAmount: discountAmount,
            type: coupon.type,
            value: coupon.value,
            message: 'Coupon applied successfully'
        });

    } catch (error) {
        console.error('Apply Coupon Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByPk(req.params.id);

        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        await coupon.destroy();
        res.json({ message: 'Coupon removed' });
    } catch (error) {
        console.error('Delete Coupon Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    createCoupon,
    getAllCoupons,
    updateCoupon,
    toggleCouponStatus,
    applyCoupon,
    deleteCoupon
};
