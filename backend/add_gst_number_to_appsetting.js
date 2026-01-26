const { sequelize } = require('./config/database');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('--- Adding gstNumber to AppSettings ---');
        try {
            await sequelize.query(`ALTER TABLE AppSettings ADD COLUMN gstNumber VARCHAR(255) NULL;`);
            console.log('✅ Column gstNumber added successfully.');
        } catch (e) {
            if (e.message.includes('Duplicate column')) {
                console.log('ℹ️ Column gstNumber already exists.');
            } else {
                throw e;
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating schema:', error.message);
        process.exit(1);
    }
}

migrate();
