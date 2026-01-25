const { sequelize } = require('./config/database');
const Cart = require('./models/cart');
const CartItem = require('./models/cartItem');
require('./models/associations'); // Ensure associations are loaded

const migrateCart = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('Syncing Cart model...');
        await Cart.sync({ alter: true });
        console.log('✅ Cart synced.');

        console.log('Syncing CartItem model...');
        await CartItem.sync({ alter: true });
        console.log('✅ CartItem synced.');

        console.log('Migration complete.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrateCart();
