const { sequelize } = require('./config/database');
const Order = require('./models/order');
require('./models/associations'); // Ensure associations are loaded

const migrateOrderTableV2 = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('Altering Order table to add address column...');
        // Sequelize sync({ alter: true }) handles column addition/removal diffs
        await Order.sync({ alter: true });

        console.log('✅ Order table updated.');

        // Verify removing Address table manually if needed, or ignore since code references are gone
        console.log('Dropping Address table if exists (optional cleanup)...');
        try {
            await sequelize.query('DROP TABLE IF EXISTS Addresses;');
            console.log('✅ Addresses table dropped.');
        } catch (e) {
            console.log('⚠️ Could not drop Addresses table:', e.message);
        }

        console.log('Migration complete.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrateOrderTableV2();
