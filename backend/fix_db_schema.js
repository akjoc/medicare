const dotenv = require('dotenv');
dotenv.config({ path: 'backend/.env.local' }); // Try backend/.env.local
dotenv.config(); // Fallback to root .env
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
        try { await sequelize.query(`ALTER TABLE Products MODIFY imageUrls JSON NULL;`); } catch (e) { } // Ensure it's nullable

        try { await sequelize.query(`ALTER TABLE Products ADD COLUMN publicIds JSON NULL;`); } catch (e) { }
        try { await sequelize.query(`ALTER TABLE Products MODIFY publicIds JSON NULL;`); } catch (e) { } // Ensure it's nullable

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

            // 6. Update SKUs to be unique
            await sequelize.query(`UPDATE Products SET sku = CONCAT('SKU-', id) WHERE sku IS NULL OR sku = '';`);
            try {
                await sequelize.query(`ALTER TABLE Products MODIFY COLUMN sku VARCHAR(255) NOT NULL;`);
                await sequelize.query(`ALTER TABLE Products ADD CONSTRAINT sku_unique UNIQUE (sku);`);
            } catch (err) {
                console.log("SKU constraint might already exist, skipping...");
            }

            // 7. Add Dosage and Packing Columns
            try {
                await sequelize.query(`ALTER TABLE Products ADD COLUMN dosage VARCHAR(255) DEFAULT NULL;`);
                console.log("Added dosage column.");
            } catch (e) {
                if (e.original && e.original.code === 'ER_DUP_FIELDNAME') {
                    console.log("dosage column already exists.");
                } else {
                    console.error("Error adding dosage column:", e.message);
                }
            }

            try {
                await sequelize.query(`ALTER TABLE Products ADD COLUMN packing VARCHAR(255) DEFAULT NULL;`);
                console.log("Added packing column.");
            } catch (e) {
                if (e.original && e.original.code === 'ER_DUP_FIELDNAME') {
                    console.log("packing column already exists.");
                } else {
                    console.error("Error adding packing column:", e.message);
                }
            }

            // 8. Create ProductCategories Table & Migrate Data
            console.log('--- Migrating Categories to Many-to-Many ---');
            try {
                await sequelize.query(`
                    CREATE TABLE IF NOT EXISTS ProductCategories (
                        id INTEGER PRIMARY KEY AUTO_INCREMENT,
                        ProductId INTEGER NOT NULL,
                        CategoryId INTEGER NOT NULL,
                        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (ProductId) REFERENCES Products(id) ON DELETE CASCADE ON UPDATE CASCADE,
                        FOREIGN KEY (CategoryId) REFERENCES Categories(id) ON DELETE CASCADE ON UPDATE CASCADE,
                        UNIQUE KEY unique_product_category (ProductId, CategoryId)
                    );
                `);
                console.log('ProductCategories table created/verified.');

                // Migrate existing CategoryId to the new table
                await sequelize.query(`
                    INSERT IGNORE INTO ProductCategories (ProductId, CategoryId)
                    SELECT id, CategoryId FROM Products
                    WHERE CategoryId IS NOT NULL;
                `);
                console.log('Migrated existing CategoryId to ProductCategories.');

            } catch (e) {
                console.log('ProductCategories migration warning:', e.message);
            }

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
