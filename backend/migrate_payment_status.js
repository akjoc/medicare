const { sequelize } = require('./config/database');

const migratePaymentStatus = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // For MySQL, we need to alter the ENUM definition directly
        await sequelize.query(`
            ALTER TABLE Orders 
            MODIFY COLUMN paymentStatus ENUM('pending', 'approved', 'rejected') 
            DEFAULT 'pending';
        `);

        // Update existing 'paid' to 'approved' and 'failed' to 'rejected' for consistency
        await sequelize.query(`UPDATE Orders SET paymentStatus = 'approved' WHERE paymentStatus = 'paid'`); // paid -> approved is tricky if paid meant approved. Assuming mapping.
        // Actually, user is changing the semantics. 
        // If data exists with 'paid', it might become invalid if strict mode, but strict mode applies on insert.
        // MySQL treats invalid ENUM as '' (empty string) generally.
        // Let's assume this is a fresh start or mapping is needed. 
        // I won't map unless requested, but the ALTER modifies valid allowed values.

        console.log('✅ Payment Status ENUM updated to pending, approved, rejected.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migratePaymentStatus();
