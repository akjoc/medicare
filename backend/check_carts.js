const { sequelize } = require('./config/database');
const Cart = require('./models/cart');
const User = require('./models/user');

const checkDuplicateCarts = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Check carts for User 11 specifically
        const userId = 11;
        const carts = await Cart.findAll({ where: { userId } });
        console.log(`Carts for User ${userId}:`, carts.map(c => c.toJSON()));

        if (carts.length > 1) {
            console.log('⚠️ DUPLICATE CARTS DETECTED!');
        } else {
            console.log('✅ Single cart found.');
            const cartItems = await sequelize.query(`SELECT * FROM CartItems WHERE cartId = ${carts[0].id}`);
            console.log('Items in Cart 1:', cartItems[0]);
        }

        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    }
};

checkDuplicateCarts();
