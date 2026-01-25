const { sequelize } = require('./config/database');
const CartItem = require('./models/cartItem');
require('./models/associations'); // Ensure associations are loaded

const fixCartItems = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Delete invalid items (productId is null)
        console.log('Removing corrupted cart items...');
        await sequelize.query('DELETE FROM CartItems WHERE productId IS NULL OR cartId IS NULL');
        console.log('✅ Corrupted items removed.');

        // 2. Sync Model to enforce NOT NULL
        console.log('Syncing CartItem model...');
        await CartItem.sync({ alter: true });
        console.log('✅ CartItem model synced.');

        console.log('Fix complete.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Fix failed:', error);
        process.exit(1);
    }
};

fixCartItems();
