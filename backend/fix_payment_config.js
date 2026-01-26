
const { sequelize } = require('./config/database');
const PaymentConfig = require('./models/PaymentConfig');

const fixConfig = async () => {
    try {
        const config = await PaymentConfig.findByPk(1);
        if (config) {
            console.log(`Current Discount Value: ${config.discountValue}`);
            config.discountValue = 5; // Reset to 5%
            await config.save();
            console.log(`Updated Discount Value to: ${config.discountValue}`);
        } else {
            console.log('Payment Config not found!');
        }
    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
};

fixConfig();
