
const { sequelize } = require('./config/database');
const PaymentConfig = require('./models/PaymentConfig');
const Coupon = require('./models/coupon');

const debugPricing = async () => {
    try {
        console.log('--- Debugging Pricing Config ---');

        // 1. Payment Config
        const config = await PaymentConfig.findByPk(1);
        if (config) {
            console.log('Payment Config:');
            console.log(JSON.stringify(config.toJSON(), null, 2));
        } else {
            console.log('Payment Config NOT FOUND');
        }

        // 2. Coupon
        const coupon = await Coupon.findOne({ where: { code: 'WELCOME50' } });
        if (coupon) {
            console.log('\nCoupon WELCOME50:');
            console.log(JSON.stringify(coupon.toJSON(), null, 2));
        } else {
            console.log('\nCoupon WELCOME50 NOT FOUND');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
};

debugPricing();
