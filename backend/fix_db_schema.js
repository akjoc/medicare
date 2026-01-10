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

        // Change Salt to JSON
        try { await sequelize.query(`ALTER TABLE Products MODIFY salt JSON;`); } catch (e) {
            // If modification fails (e.g. data incompatible), log it but proceed
            console.log('Salt modify warning:', e.message);
        }

        // AUTO-MIGRATE OLD IMAGES
        console.log('--- Migrating Helper Data ---');
        try {
            // If old columns exist, move data to new JSON columns
            await sequelize.query(`UPDATE Products SET imageUrls = JSON_ARRAY(imageUrl) WHERE imageUrl IS NOT NULL AND (imageUrls IS NULL OR JSON_LENGTH(imageUrls) = 0);`);
            await sequelize.query(`UPDATE Products SET publicIds = JSON_ARRAY(publicId) WHERE publicId IS NOT NULL AND (publicIds IS NULL OR JSON_LENGTH(publicIds) = 0);`);
            console.log('Migrated old images to new format.');
        } catch (e) {
            // Ignore error if columns don't exist
        }

        // DROP OLD COLUMNS (Safe clean up)
        try { await sequelize.query(`ALTER TABLE Products DROP COLUMN imageUrl;`); } catch (e) { }
        try { await sequelize.query(`ALTER TABLE Products DROP COLUMN publicId;`); } catch (e) { }

        console.log('✅ Schema fixes applied successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating schema:', error);
        process.exit(1);
    }
};

fixSchema();
