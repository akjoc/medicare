const { Cart, CartItem, Product, User } = require('../models/associations');

// Get User's Cart
const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        let cart = await Cart.findOne({
            where: { userId },
            include: [{
                model: CartItem,
                include: [{
                    model: Product,
                    // attributes: ['id', 'name', 'price', 'imageUrl', 'stock', 'sku', 'salePrice', 'buyingPrice', 'companies', 'dosage', 'packing']
                }]
            }]
        });

        if (!cart) {
            cart = await Cart.create({ userId });
            cart.dataValues.CartItems = []; // Return empty items
        }

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add Item to Cart
const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;
        const qty = parseInt(quantity) || 1;

        if (!productId) return res.status(400).json({ error: 'Product ID required' });

        // Find or Create Cart
        let cart = await Cart.findOne({ where: { userId } });
        if (!cart) {
            cart = await Cart.create({ userId });
        }

        // Check Product Stock
        const product = await Product.findByPk(productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        // Check if item exists in cart
        let cartItem = await CartItem.findOne({
            where: {
                cartId: cart.id,
                productId
            }
        });

        const currentQty = cartItem ? cartItem.quantity : 0;
        const totalQty = currentQty + qty;

        if (product.stock < totalQty) {
            return res.status(400).json({ error: `Insufficient stock. Only ${product.stock} available.` });
        }

        if (cartItem) {
            // Update quantity
            cartItem.quantity = totalQty;
            await cartItem.save();
        } else {
            // Create new item
            await CartItem.create({
                cartId: cart.id,
                productId,
                quantity: qty
            });
        }

        // Return updated cart
        const updatedCart = await Cart.findOne({
            where: { id: cart.id },
            include: [{ model: CartItem, include: [Product] }]
        });

        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Item Quantity
const updateCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;
        const newQty = parseInt(quantity);

        const cart = await Cart.findOne({ where: { userId } });
        if (!cart) return res.status(404).json({ error: 'Cart not found' });

        const cartItem = await CartItem.findOne({
            where: { cartId: cart.id, productId }
        });

        if (!cartItem) return res.status(404).json({ error: 'Item not in cart' });

        if (newQty <= 0) {
            await cartItem.destroy();
        } else {
            // Check Product Stock
            const product = await Product.findByPk(productId);
            if (!product) return res.status(404).json({ error: 'Product not found' });

            if (product.stock < newQty) {
                return res.status(400).json({ error: `Insufficient stock. Only ${product.stock} available.` });
            }

            cartItem.quantity = newQty;
            await cartItem.save();
        }

        // Return updated cart
        const updatedCart = await Cart.findOne({
            where: { id: cart.id },
            include: [{ model: CartItem, include: [Product] }]
        });

        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove Item (by Cart Item ID)
const removeCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params; // Changed from productId to itemId

        const cart = await Cart.findOne({ where: { userId } });
        if (!cart) return res.status(404).json({ error: 'Cart not found' });

        // Delete using Cart Item ID (Primary Key)
        // Ensure it belongs to the user's cart for security
        const deletedCount = await CartItem.destroy({
            where: {
                id: itemId,
                cartId: cart.id
            }
        });

        if (deletedCount === 0) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        // Return updated cart
        const updatedCart = await Cart.findOne({
            where: { id: cart.id },
            include: [{ model: CartItem, include: [Product] }]
        });

        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Clear Cart
const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ where: { userId } });

        if (cart) {
            await CartItem.destroy({ where: { cartId: cart.id } });
        }

        res.status(200).json({ message: 'Cart cleared', cart: { id: cart?.id, CartItems: [] } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
};
