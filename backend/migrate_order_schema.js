const { sequelize } = require('./config/database');
const Order = require('./models/order');

const updateOrderSchema = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('Syncing Order model (altering table)...');
        await Order.sync({ alter: true });
        console.log('✅ Order table updated with new columns.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Update failed:', error);
        process.exit(1);
    }
};

updateOrderSchema();
