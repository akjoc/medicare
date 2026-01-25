const { sequelize } = require('./config/database');

const migrateOrderStatusWorkflow = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Step 1: Change to VARCHAR to verify data manipulation freely
        await sequelize.query(`ALTER TABLE Orders MODIFY COLUMN status VARCHAR(50)`);

        // Step 2: Update existing data to match new workflow (Title Case)
        await sequelize.query(`UPDATE Orders SET status = 'Processing' WHERE status = 'pending'`);
        await sequelize.query(`UPDATE Orders SET status = 'Packed' WHERE status = 'confirmed'`);
        await sequelize.query(`UPDATE Orders SET status = 'Out for Delivery' WHERE status = 'shipped'`);
        await sequelize.query(`UPDATE Orders SET status = 'Delivered' WHERE status = 'delivered'`);
        await sequelize.query(`UPDATE Orders SET status = 'Cancelled' WHERE status = 'cancelled'`);

        // Step 3: Change back to ENUM with strict new set
        // Note: 'Awaiting Payment Confirmation' is preserved.
        await sequelize.query(`
            ALTER TABLE Orders 
            MODIFY COLUMN status ENUM('Processing', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled', 'Awaiting Payment Confirmation') 
            DEFAULT 'Processing';
        `);

        console.log('✅ Order Status ENUM updated and existing data migrated.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateOrderStatusWorkflow();
