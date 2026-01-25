const { sequelize } = require('./config/database');
const Order = require('./models/order');

const inspectOrder = async () => {
    try {
        await sequelize.authenticate();
        const order = await Order.findByPk(5);
        if (order) {
            console.log('Order Found:', JSON.stringify(order.toJSON(), null, 2));
        } else {
            console.log('Order ID 5 NOT FOUND');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

inspectOrder();
