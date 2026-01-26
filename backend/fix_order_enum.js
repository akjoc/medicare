
const { sequelize } = require('./config/database');

const fixEnum = async () => {
    try {
        console.log('Updating Orders Table Status Enum...');
        await sequelize.query(`
            ALTER TABLE Orders 
            MODIFY COLUMN status 
            ENUM('Processing', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled', 'Awaiting Payment Confirmation', 'pending') 
            DEFAULT 'Processing';
        `);
        console.log('Successfully updated Orders status ENUM.');
    } catch (error) {
        console.error('Error updating ENUM:', error);
    } finally {
        process.exit();
    }
};

fixEnum();
