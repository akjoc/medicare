
const { sequelize } = require('./config/database');

const fixPaymentStatusEnum = async () => {
    try {
        console.log('Updating Orders Table PaymentStatus Enum...');
        // We modify the column to include 'pending', 'approved', 'rejected'
        // We might also want to include 'paid' or 'failed' if those were legacy values, 
        // but let's stick to the model definition: 'pending', 'approved', 'rejected'.
        // To be safe, I'll check if there are other values commonly used like 'completed' just in case, 
        // but strictly following the model is usually best.

        await sequelize.query(`
            ALTER TABLE Orders 
            MODIFY COLUMN paymentStatus 
            ENUM('pending', 'approved', 'rejected', 'completed', 'failed', 'paid') 
            DEFAULT 'pending';
        `);
        // I added completed/failed/paid just in case there are legacy rows with those values 
        // to avoid truncating THEM during the alter. 
        // But primary goal is adding 'rejected' and 'approved'.

        console.log('Successfully updated Orders paymentStatus ENUM.');
    } catch (error) {
        console.error('Error updating paymentStatus ENUM:', error);
    } finally {
        process.exit();
    }
};

fixPaymentStatusEnum();
