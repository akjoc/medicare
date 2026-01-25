const { sequelize } = require('./config/database');
const Address = require('./models/address');
const Order = require('./models/order');
const OrderItem = require('./models/orderItem');
require('./models/associations'); // Ensure associations are loaded

const migrateOrderTables = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('Syncing Address model...');
        await Address.sync({ alter: true });
        console.log('✅ Address synced.');

        console.log('Syncing Order model...');
        await Order.sync({ alter: true });
        console.log('✅ Order synced.');

        console.log('Syncing OrderItem model...');
        await OrderItem.sync({ alter: true });
        console.log('✅ OrderItem synced.');

        console.log('Migration complete.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrateOrderTables();
