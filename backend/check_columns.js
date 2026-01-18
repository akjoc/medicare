const dotenv = require('dotenv');
dotenv.config({ path: 'backend/.env.local' });
dotenv.config();
const { sequelize } = require('./config/database');

const checkColumns = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const [results, metadata] = await sequelize.query("DESCRIBE Products;");
        console.log('--- Products Table Columns ---');
        console.table(results);

        const dosageExists = results.some(r => r.Field === 'dosage');
        const packingExists = results.some(r => r.Field === 'packing');

        console.log('Dosage column exists:', dosageExists);
        console.log('Packing column exists:', packingExists);

        // Force add if missing
        if (!dosageExists) {
            console.log("Attempting to add 'dosage' column...");
            try {
                await sequelize.query("ALTER TABLE Products ADD COLUMN dosage VARCHAR(255) DEFAULT NULL;");
                console.log("Successfully added 'dosage'.");
            } catch (e) {
                console.error("Error adding 'dosage':", e.message);
            }
        }

        if (!packingExists) {
            console.log("Attempting to add 'packing' column...");
            try {
                await sequelize.query("ALTER TABLE Products ADD COLUMN packing VARCHAR(255) DEFAULT NULL;");
                console.log("Successfully added 'packing'.");
            } catch (e) {
                console.error("Error adding 'packing':", e.message);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkColumns();
