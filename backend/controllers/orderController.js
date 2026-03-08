const { Cart, CartItem, Product, User, Order, OrderItem, Coupon, AppSetting, PaymentConfig, Retailer, Category } = require('../models/associations');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const { generateInvoicePDF } = require('../utils/invoiceGenerator');
const { uploadPDFToCloudinary } = require('../config/cloudinaryConfig');

// Helper to calc delivery fee (Mock logic or DB config)
// Helper to calc delivery fee (Mock logic or DB config)
const calculateDeliveryFee = async (subTotal, address) => {
    // Delivery is FREE for all
    return 0;
};

const getValidCoupon = async (code, subTotal, validItems, userId) => {
    if (!code) return { discount: 0, couponId: null };

    const coupon = await Coupon.findOne({ where: { code: code.toUpperCase() } });
    if (!coupon) return { error: 'Invalid coupon code', discount: 0 };

    if (!coupon.isActive) return { error: 'Coupon is inactive', discount: 0 };

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return { error: 'Coupon usage limit exceeded', discount: 0 };
    }

    // Retailer Restriction
    if (coupon.retailerIds && coupon.retailerIds.length > 0) {
        const retailer = await Retailer.findOne({ where: { UserId: userId } }); // Assuming Retailer has a userId foreign key
        // Assuming retailerIds in coupon stores Retailer.id
        if (!retailer || !coupon.retailerIds.includes(retailer.id)) {
            return { error: 'Coupon not applicable for this retailer', discount: 0 };
        }
    }

    // Category Restriction
    // If categories defined, discount applies ONLY to eligible items
    let eligibleSubTotal = subTotal;

    if (coupon.categoryIds && coupon.categoryIds.length > 0) {
        let matchingItemsTotal = 0;
        let hasMatchingItems = false;

        for (const item of validItems) {
            // item.Product.Categories must be fetched
            if (!item.Product.Categories) continue;

            const itemCatIds = item.Product.Categories.map(c => c.id);
            const isMatch = itemCatIds.some(cId => coupon.categoryIds.includes(cId));

            if (isMatch) {
                const price = item.Product.salePrice || item.Product.price || 0;
                matchingItemsTotal += (parseFloat(price) * item.quantity);
                hasMatchingItems = true;
            }
        }

        if (!hasMatchingItems) {
            return { error: 'Coupon not applicable for items in cart', discount: 0 };
        }
        eligibleSubTotal = matchingItemsTotal;
    }

    let discount = 0;
    if (coupon.type === 'percent') {
        discount = (eligibleSubTotal * coupon.value) / 100;
    } else {
        discount = coupon.value; // Flat discount
        // Logic: Should flat discount apply only if eligible items total >= discount?
        // Usually flat discount is on the cart, but if restricted by category, maybe it shouldn't exceed eligible total?
        // Or strictly if eligible items exist, apply full flat discount to order.
        // Let's safe guard: discount cannot exceed eligibleSubTotal if category restricted.
        if (coupon.categoryIds && coupon.categoryIds.length > 0) {
            if (discount > eligibleSubTotal) discount = eligibleSubTotal;
        }
    }

    // Final check
    if (discount > subTotal) discount = subTotal;

    return { discount, couponId: coupon.id, coupon };
};

// Checkout Summary
// Body: { address, paymentMethod, couponCode }
// Address is now passed directly as string or object
const getCheckoutSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const { paymentMethod, couponCode } = req.body;

        // 1. Fetch Cart
        const cart = await Cart.findOne({
            where: { userId },
            include: [{
                model: CartItem,
                include: [{
                    model: Product,
                    include: [Category]
                }]
            }]
        });

        if (!cart || cart.CartItems.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // 2. Calc Subtotal
        let subTotal = 0;
        const validItems = [];

        for (const item of cart.CartItems) {
            if (!item.Product) {
                await item.destroy(); // Remove invalid/orphan item
                continue;
            }
            validItems.push(item);
            const price = item.Product.salePrice || item.Product.price || 0;
            subTotal += (parseFloat(price) * item.quantity);
        }

        if (validItems.length === 0) {
            return res.status(400).json({ error: 'Cart is empty (invalid items removed)' });
        }

        // 3. Delivery Fee
        // 3. Delivery Fee
        const deliveryFee = await calculateDeliveryFee(subTotal);

        // 4. Coupon Discount
        let couponDiscount = 0;
        let couponError = null;

        if (couponCode) {
            const couponResult = await getValidCoupon(couponCode, subTotal, validItems, userId);
            if (couponResult.error) {
                // If checking out merely for summary, maybe just return 0 discount but warn?
                // Or checking fail? Let's treat valid code as requirement if passed
                // But for summary, often users type partial codes. 
                // Let's return error in a separate field or fail?
                // User asked "match the coupon code", usually expects feedback if invalid.
                // I will ignore error if code is empty, but if provided and invalid, I should probably signal it.
                // For now, let's just set discount 0. 
                // Wait, user provided "SAVE50" in screenshot.
                // Let's return error 400 if strictly invalid? 
                // Actually returning 'couponError' in response is better UI UX usually.
                if (couponResult.error) return res.status(400).json({ error: couponResult.error });
            }
            couponDiscount = couponResult.discount;
        }

        // 5. Payment Method Discount (e.g. 5% for ONLINE)
        // 5. Payment Method Discount (e.g. 5% for ONLINE)
        let paymentDiscount = 0;
        if (paymentMethod === 'ONLINE') {
            const amountAfterCoupon = Math.max(0, subTotal - couponDiscount);
            paymentDiscount = (amountAfterCoupon * 0.05); // 5%
        }

        // 6. Total
        const totalAmount = subTotal + deliveryFee - couponDiscount - paymentDiscount;

        // Clean up response items
        const cleanItems = validItems.map(item => ({
            id: item.id,
            quantity: item.quantity,
            Product: item.Product
        }));

        res.status(200).json({
            cartItems: cleanItems,
            billDetails: {
                itemTotal: parseFloat(subTotal).toFixed(2),
                deliveryFee: deliveryFee === 0 ? 'FREE' : parseFloat(deliveryFee).toFixed(2),
                couponDiscount: parseFloat(couponDiscount).toFixed(2),
                paymentDiscount: parseFloat(paymentDiscount).toFixed(2),
                toPay: parseFloat(totalAmount).toFixed(2)
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Place Order
const placeOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.id;
        const {
            address,
            paymentMethod,
            couponCode,
            toPay,
            cartItems,
            itemTotal,
            deliveryFee: clientDeliveryFee,
            couponDiscount: clientCouponDiscount,
            paymentDiscount: clientPaymentDiscount
        } = req.body;


        if (!address) {
            await t.rollback();
            return res.status(400).json({ error: 'Address is required' });
        }

        // Mandatory Financial Fields Check
        // Mandatory Financial Fields Check (Relaxed: Coupons/Discounts optional)
        if (itemTotal === undefined || clientDeliveryFee === undefined || toPay === undefined) {
            await t.rollback();
            return res.status(400).json({ error: 'Missing required financial fields: itemTotal, deliveryFee, and toPay are mandatory.' });
        }

        // 1. Fetch Payment Configuration
        const paymentConfig = await PaymentConfig.findByPk(1); // Assuming single config row
        if (!paymentConfig) {
            await t.rollback();
            return res.status(500).json({ error: 'Payment configuration missing' });
        }

        // Validate Payment Method
        if (paymentMethod === 'COD' && !paymentConfig.codEnabled) {
            await t.rollback();
            return res.status(400).json({ error: 'Cash on Delivery is currently disabled' });
        }
        if (paymentMethod === 'ONLINE' && !paymentConfig.advancePaymentEnabled) {
            await t.rollback();
            return res.status(400).json({ error: 'Online payment is currently disabled' });
        }

        console.log('Payment Config Used:', {
            enabled: paymentConfig.advancePaymentDiscountEnabled,
            type: paymentConfig.discountType,
            value: paymentConfig.discountValue
        });

        // 2. Fetch Retailer Details (Snapshot)
        const retailer = await Retailer.findOne({ where: { UserId: userId } });
        const retailerName = retailer ? retailer.ownerName : null;
        const shopName = retailer ? retailer.shopName : null;

        // 3. Fetch Cart & Validate Stock
        const cart = await Cart.findOne({
            where: { userId },
            include: [{
                model: CartItem,
                include: [{
                    model: Product,
                    include: [Category]
                }]
            }]
        });

        if (!cart || cart.CartItems.length === 0) {
            await t.rollback();
            return res.status(400).json({ error: 'Cart is empty' });
        }

        let subTotal = 0;
        const validItems = [];

        for (const item of cart.CartItems) {
            if (!item.Product) {
                await item.destroy();
                continue;
            }
            if (item.Product.stock < item.quantity) {
                await t.rollback();
                return res.status(400).json({ error: `Insufficient stock for ${item.Product.name}` });
            }
            validItems.push(item);
            const price = item.Product.salePrice || item.Product.price || 0;
            subTotal += (parseFloat(price) * item.quantity);
        }

        if (validItems.length === 0) {
            await t.rollback();
            return res.status(400).json({ error: 'Cart is empty (invalid items removed)' });
        }

        // Cart Item Verification (Strict Check)
        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            await t.rollback();
            return res.status(400).json({ error: 'Cart items are required in request body' });
        }

        // Compare body items with DB items
        // 1. Check length
        if (cartItems.length !== validItems.length) {
            await t.rollback();
            return res.status(400).json({ error: 'Cart mismatch: Item count differs' });
        }

        // 2. Check each item
        for (const dbItem of validItems) {
            const bodyItem = cartItems.find(i => i.productId === dbItem.productId);
            if (!bodyItem) {
                await t.rollback();
                return res.status(400).json({ error: `Cart mismatch: Product ID ${dbItem.productId} missing in request` });
            }
            if (parseInt(bodyItem.quantity) !== dbItem.quantity) {
                await t.rollback();
                return res.status(400).json({ error: `Cart mismatch: Quantity for Product ID ${dbItem.productId} differs` });
            }
        }

        const deliveryFee = await calculateDeliveryFee(subTotal);

        // 4. Calculate Discounts

        // Coupon Discount
        let couponDiscount = 0;
        let validCouponCode = null;

        if (couponCode) {
            const couponResult = await getValidCoupon(couponCode, subTotal, validItems, userId);
            if (couponResult.error) {
                await t.rollback();
                return res.status(400).json({ error: couponResult.error });
            }
            couponDiscount = couponResult.discount;
            validCouponCode = couponCode;

            // Increment usage
            if (couponResult.coupon) {
                await couponResult.coupon.increment('usageCount', { transaction: t });
            }
        }

        // Payment Discount (Dynamic from Config)
        let paymentDiscount = 0;
        if (paymentMethod === 'ONLINE' && paymentConfig.advancePaymentDiscountEnabled) {
            // Apply discount on remaining amount after coupon
            const amountAfterCoupon = Math.max(0, subTotal - couponDiscount);

            if (paymentConfig.discountType === 'PERCENT') {
                paymentDiscount = (amountAfterCoupon * paymentConfig.discountValue) / 100;
            } else {
                paymentDiscount = paymentConfig.discountValue;
            }
        }

        // Final Total
        let finalTotal = subTotal + deliveryFee - couponDiscount - paymentDiscount;
        if (finalTotal < 0) finalTotal = 0;

        // --- STRICT VALIDATION START ---

        // 1. Check Item Total
        if (itemTotal !== undefined) {
            if (Math.abs(parseFloat(itemTotal) - subTotal) > 0.5) {
                await t.rollback();
                return res.status(400).json({ error: `Price Mismatch: Item Total differs. Server: ${subTotal}, Client: ${itemTotal}` });
            }
        }

        // 2. Check Delivery Fee
        if (clientDeliveryFee !== undefined) {
            const clientFee = clientDeliveryFee === 'FREE' ? 0 : parseFloat(clientDeliveryFee);
            if (Math.abs(clientFee - deliveryFee) > 0.5) {
                await t.rollback();
                return res.status(400).json({ error: `Price Mismatch: Delivery Fee differs. Server: ${deliveryFee}, Client: ${clientFee}` });
            }
        }

        // 3. Check Coupon Discount
        if (clientCouponDiscount !== undefined) {
            if (Math.abs(parseFloat(clientCouponDiscount) - couponDiscount) > 0.5) {
                await t.rollback();
                return res.status(400).json({ error: `Price Mismatch: Coupon Discount differs. Server: ${couponDiscount}, Client: ${clientCouponDiscount}` });
            }
        }

        // 4. Check Payment Discount
        if (clientPaymentDiscount !== undefined) {
            if (Math.abs(parseFloat(clientPaymentDiscount) - paymentDiscount) > 0.5) {
                await t.rollback();
                return res.status(400).json({ error: `Price Mismatch: Payment Discount differs. Server: ${paymentDiscount}, Client: ${clientPaymentDiscount}` });
            }
        }

        // 5. Check Final ToPay (Existing check, refined)
        if (toPay) {
            const clientTotal = parseFloat(toPay);
            const serverTotal = parseFloat(finalTotal.toFixed(2));

            if (Math.abs(clientTotal - serverTotal) > 0.5) {
                await t.rollback();
                return res.status(400).json({
                    error: 'Price Mismatch: Final Total differs.',
                    serverTotal: serverTotal,
                    clientTotal: clientTotal
                });
            }
        }
        // --- STRICT VALIDATION END ---

        // 5. Create Order
        const addressStr = typeof address === 'object' ? JSON.stringify(address) : address;

        const order = await Order.create({
            userId,
            address: addressStr,
            totalAmount: parseFloat(finalTotal).toFixed(2),
            subTotal: parseFloat(subTotal).toFixed(2),
            discount: parseFloat(couponDiscount + paymentDiscount).toFixed(2), // Total discount field for backward compat
            couponDiscount: parseFloat(couponDiscount).toFixed(2),    // New separate field
            paymentDiscount: parseFloat(paymentDiscount).toFixed(2),   // New separate field
            couponCode: validCouponCode,
            deliveryFee: parseFloat(deliveryFee).toFixed(2),
            paymentMethod,
            deliveryFee,
            paymentMethod,
            paymentStatus: 'pending',
            status: paymentMethod === 'ONLINE' ? 'Awaiting Payment Confirmation' : 'Processing',
            retailerName,
            shopName
        }, { transaction: t });

        // 6. Create OrderItems & Deduct Stock
        for (const item of validItems) {
            await OrderItem.create({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.Product.salePrice || item.Product.price || 0
            }, { transaction: t });

            // Reduce Stock
            const product = await Product.findByPk(item.productId, { transaction: t });
            product.stock = product.stock - item.quantity;
            await product.save({ transaction: t });
        }

        // 7. Clear Cart
        await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });

        await t.commit();

        res.status(201).json({
            message: 'Order placed successfully',
            orderId: order.id,
            totalAmount: parseFloat(finalTotal).toFixed(2),
            paymentMethod: paymentMethod,
            itemTotal: parseFloat(subTotal).toFixed(2),
            deliveryFee: deliveryFee === 0 ? 'FREE' : parseFloat(deliveryFee).toFixed(2),
            couponDiscount: parseFloat(couponDiscount).toFixed(2),
            paymentDiscount: parseFloat(paymentDiscount).toFixed(2),
            couponCode: validCouponCode,
            toPay: parseFloat(finalTotal).toFixed(2),
        });

    } catch (error) {
        if (t && !t.finished) await t.rollback();
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { userId: req.user.id },
            include: [
                {
                    model: OrderItem,
                    include: [{
                        model: Product,
                        attributes: ['id', 'name', 'sku', 'description', 'imageUrls', 'companies', 'salt', 'dosage', 'packing']
                    }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Get all orders (Admin/Retailer)
// @route   GET /api/orders/all
// @access  Private/Admin
// @desc    Get all orders (Admin/Retailer)
// @route   GET /api/orders/all
// @access  Private/Admin
const getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const status = req.query.status;

        // Build Query
        const whereClause = {};

        if (status) {
            whereClause.status = status;
        }

        if (search) {
            const searchConditions = [
                { retailerName: { [Op.like]: `%${search}%` } },
                { shopName: { [Op.like]: `%${search}%` } }
            ];

            // If search term is a number, allow searching by Order ID
            if (!isNaN(search)) {
                searchConditions.push({ id: parseInt(search) });
            }

            whereClause[Op.or] = searchConditions;
        }

        const { count, rows } = await Order.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, attributes: ['id', 'name', 'email'] },
                {
                    model: OrderItem,
                    include: [{
                        model: Product,
                        // Sanitize Product details
                        attributes: ['id', 'name', 'sku', 'description', 'imageUrls', 'companies', 'salt', 'dosage', 'packing']
                    }]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset,
            distinct: true // Important for correct count with includes
        });

        res.json({
            orders: rows,
            total: count,
            page,
            pages: Math.ceil(count / limit),
            limit
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Upload Invoice (Admin)
// @route   POST /api/orders/:id/invoice
// @access  Private/Admin
const uploadInvoice = async (req, res) => {
    try {
        const orderId = req.params.id;

        if (!req.file) {
            return res.status(400).json({ error: 'No invoice file uploaded' });
        }

        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // req.file.path contains the Cloudinary URL
        order.invoiceUrl = req.file.path;
        await order.save();

        res.json({
            message: 'Invoice uploaded successfully',
            invoiceUrl: order.invoiceUrl
        });

    } catch (error) {
        console.error('Upload Invoice Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Get all orders for a particular retailer (Admin)
// @route   GET /api/orders/retailer/:retailerId
// @access  Private/Admin
const getRetailerOrders = async (req, res) => {
    try {
        const { retailerId } = req.params;
        // Assuming retailerId passed here is the User ID of the retailer
        // If it's the Retailer table ID, we need to find associated User ID or store retailerId in Order.
        // Current implementation: Order stores 'userId' (which is the retailer's user account).
        // Let's assume params is userId. If prompt meant Retailer ID, we might need a lookup.
        // But usually Retailer ID = User ID in simplified relationships or we check.
        // Let's use userId for now as it's the FK in Order.

        const orders = await Order.findAll({
            where: { userId: retailerId },
            include: [
                { model: User, attributes: ['id', 'name', 'email'] },
                {
                    model: OrderItem,
                    include: [{
                        model: Product,
                        attributes: ['id', 'name', 'sku', 'description', 'imageUrls', 'companies', 'salt', 'dosage', 'packing']
                    }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Get Order by ID (Admin or Order Owner)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findByPk(orderId, {
            include: [
                { model: User, attributes: ['id', 'name', 'email'] },
                {
                    model: OrderItem,
                    include: [{
                        model: Product,
                        // Sanitize Product details (Hide buyingPrice, salePrice, stock)
                        attributes: ['id', 'name', 'sku', 'description', 'imageUrls', 'companies', 'salt', 'dosage', 'packing']
                    }]
                }
            ]
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Access Control
        // 1. Admin can see any order
        // 2. User can see ONLY their own order
        if (req.user.role !== 'admin' && order.userId !== req.user.id) {
            return res.status(401).json({ error: 'Not authorized to view this order' });
        }

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Update Payment Status (Admin)
// @route   PUT /api/orders/:id/payment-status
// @access  Private/Admin
const updatePaymentStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        const allowedStatuses = ['pending', 'approved', 'rejected'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}` });
        }

        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.paymentStatus = status;

        if (status === 'approved') {
            order.status = 'Processing';
        } else if (status === 'rejected') {
            order.status = 'Cancelled';
        }

        await order.save();

        res.json({ message: 'Payment status updated', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Update Order Status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        const allowedStatuses = ['Processing', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled', 'Awaiting Payment Confirmation'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}` });
        }

        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Validation: Cannot cancel if already delivered
        if (status === 'Cancelled' && order.status === 'Delivered') {
            return res.status(400).json({ error: 'Cannot cancel an order that has already been delivered.' });
        }

        order.status = status;
        await order.save();

        res.json({ message: 'Order status updated', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Rate an order (Admin) & Update Retailer Rating
// @route   PUT /api/orders/:id/rate
// @access  Private/Admin
const rateOrder = async (req, res) => {
    try {
        const { rating, review } = req.body;
        const orderId = req.params.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update Order
        order.rating = rating;
        if (review) order.review = review;
        await order.save();

        // --- Aggregation Logic ---
        // 1. Find all rated orders for this Retailer (User)
        // Note: order.userId IS the retailer's User ID.
        const retailerUserId = order.userId;

        const result = await Order.findAll({
            where: {
                userId: retailerUserId,
                rating: { [Op.ne]: null }
            },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']
            ],
            raw: true
        });

        const avgRating = result[0].avgRating ? parseFloat(result[0].avgRating) : 0;

        // 2. Update Retailer Table
        // Need to find Retailer by UserId
        const retailer = await Retailer.findOne({ where: { UserId: retailerUserId } });
        if (retailer) {
            // Round to 1 decimal place
            retailer.rating = parseFloat(avgRating.toFixed(1));
            await retailer.save();
        }

        res.json({
            message: 'Order rated successfully',
            orderRating: order.rating,
            retailerNewRating: retailer ? retailer.rating : null
        });

    } catch (error) {
        console.error('Rate Order Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Auto-Generate Invoice PDF (Admin)
// @route   POST /api/orders/:id/generate-invoice
// @access  Private/Admin
const generateInvoice = async (req, res) => {
    try {
        const orderId = req.params.id;

        // 1. Fetch order with all related data
        const order = await Order.findByPk(orderId, {
            include: [
                { model: User, attributes: ['id', 'name', 'email'] },
                {
                    model: OrderItem,
                    include: [{
                        model: Product,
                        attributes: ['id', 'name', 'sku', 'description', 'imageUrls', 'companies', 'salt', 'dosage', 'packing']
                    }]
                }
            ]
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // 2. Validate order status - only generate invoices for confirmed orders
        const allowedStatuses = ['Processing', 'Packed', 'Out for Delivery', 'Delivered'];
        if (!allowedStatuses.includes(order.status)) {
            return res.status(400).json({
                error: 'Invoice cannot be generated for this order status',
                currentStatus: order.status,
                message: order.status === 'Cancelled'
                    ? 'Cannot generate invoice for cancelled orders'
                    : 'Invoice can only be generated for confirmed orders (Processing, Packed, Out for Delivery, or Delivered)'
            });
        }

        // 3. Fetch app settings for company information
        const appSettings = await AppSetting.findByPk(1);
        if (!appSettings) {
            return res.status(500).json({ error: 'App settings not configured' });
        }

        // 4. Generate PDF
        const pdfBuffer = await generateInvoicePDF(order, appSettings);

        // 5. Upload to Cloudinary
        const fileName = `invoice_${orderId}_${Date.now()}`;
        const uploadResult = await uploadPDFToCloudinary(pdfBuffer, fileName);

        // 6. Update order with invoice URL
        order.invoiceUrl = uploadResult.secure_url;
        await order.save();

        res.status(200).json({
            message: 'Invoice generated successfully',
            invoiceUrl: order.invoiceUrl,
            orderId: order.id
        });

    } catch (error) {
        console.error('Generate Invoice Error:', error);
        res.status(500).json({ error: 'Failed to generate invoice', details: error.message });
    }
};

module.exports = { getCheckoutSummary, placeOrder, getUserOrders, getAllOrders, uploadInvoice, getRetailerOrders, getOrderById, updatePaymentStatus, updateOrderStatus, rateOrder, generateInvoice };
