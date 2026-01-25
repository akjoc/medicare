const { sequelize } = require('./config/database');

const migrateOrderStatus = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Alter the ENUM definition to include 'Awaiting Payment Confirmation'
        await sequelize.query(`
            ALTER TABLE Orders 
            MODIFY COLUMN status ENUM('pending', 'Awaiting Payment Confirmation', 'confirmed', 'shipped', 'delivered', 'cancelled') 
            DEFAULT 'pending';
        `);

        console.log('✅ Order Status ENUM updated.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateOrderStatus();
