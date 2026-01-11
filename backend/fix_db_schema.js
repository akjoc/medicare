const { sequelize } = require('./config/database');

const fixSchema = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // RETAILER UPDATES
        console.log('--- Fixing Retailers Table ---');
        try { await sequelize.query(`ALTER TABLE Retailers ADD COLUMN gst VARCHAR(255) NULL;`); } catch (e) { }
        try { await sequelize.query(`ALTER TABLE Retailers ADD COLUMN rating FLOAT NOT NULL DEFAULT 5.0;`); } catch (e) { }
        try { await sequelize.query(`ALTER TABLE Retailers ADD COLUMN isActive BOOLEAN DEFAULT true;`); } catch (e) { }
        try { await sequelize.query(`ALTER TABLE Retailers MODIFY drugLicenseNumber VARCHAR(255) NULL;`); } catch (e) { }

        // PRODUCT UPDATES
        console.log('--- Fixing Products Table ---');
        try { await sequelize.query(`ALTER TABLE Products ADD COLUMN buyingPrice FLOAT NULL;`); } catch (e) { }
        try { await sequelize.query(`ALTER TABLE Products ADD COLUMN salePrice FLOAT NULL;`); } catch (e) { }
        try { await sequelize.query(`ALTER TABLE Products ADD COLUMN companies JSON NULL;`); } catch (e) { }
        try { await sequelize.query(`ALTER TABLE Products ADD COLUMN imageUrls JSON NULL;`); } catch (e) { }
        try { await sequelize.query(`ALTER TABLE Products ADD COLUMN publicIds JSON NULL;`); } catch (e) { }

        try { await sequelize.query(`ALTER TABLE Products MODIFY salt JSON;`); } catch (e) { console.log('Salt modify warning:', e.message); }

        // SKU MIGRATION (The Smart Part)
        console.log('--- Migrating SKU ---');
        try {
            // 1. Add SKU column (Nullable first)
            await sequelize.query(`ALTER TABLE Products ADD COLUMN sku VARCHAR(255) NULL;`);
            console.log('Added sku column.');
        } catch (e) {
            if (!e.message.includes('Duplicate column')) console.log('Add sku failed:', e.message);
        }

        try {
            // 2. Populate existing rows that have NULL SKU
            // Use ID to guarantee uniqueness: SKU-1, SKU-2, etc.
            await sequelize.query(`UPDATE Products SET sku = CONCAT('SKU-', id) WHERE sku IS NULL;`);
            console.log('Populated missing SKUs.');

            // 3. Add Unique Index
            await sequelize.query(`ALTER TABLE Products ADD UNIQUE (sku);`);
            console.log('Added UNIQUE constraint to sku.');

            // 4. Set NOT NULL
            await sequelize.query(`ALTER TABLE Products MODIFY sku VARCHAR(255) NOT NULL;`);
            console.log('Set sku to NOT NULL.');

        } catch (e) {
            console.log('SKU Migration steps warning (might already exist):', e.message);
        }

        console.log('✅ Schema fixes applied successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating schema:', error);
        process.exit(1);
    }
};

fixSchema();
