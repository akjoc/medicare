const { sequelize } = require('./config/database');
const dotenv = require('dotenv');
dotenv.config(); // Load .env (standard)
dotenv.config({ path: '.env.local' }); // Load .env.local (override)

async function migrateVPS() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Category: parentId
        console.log('--- Checking Categories ---');
        const [catCols] = await sequelize.query("SHOW COLUMNS FROM `Categories` LIKE 'parentId'");
        if (catCols.length === 0) {
            console.log('Adding parentId to Categories...');
            await sequelize.query("ALTER TABLE `Categories` ADD COLUMN `parentId` INTEGER NULL;");
            await sequelize.query("ALTER TABLE `Categories` ADD CONSTRAINT `fk_category_parent` FOREIGN KEY (`parentId`) REFERENCES `Categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;");
            console.log('✅ parentId added.');
        } else {
            console.log('✓ parentId exists.');
        }

        // 2. Retailer: isActive
        console.log('--- Checking Retailers ---');
        const [retCols] = await sequelize.query("SHOW COLUMNS FROM `Retailers` LIKE 'isActive'");
        if (retCols.length === 0) {
            console.log('Adding isActive to Retailers...');
            await sequelize.query("ALTER TABLE `Retailers` ADD COLUMN `isActive` BOOLEAN DEFAULT true;");
            console.log('✅ isActive added.');
        } else {
            console.log('✓ isActive exists.');
        }

        // 3. Product: salt
        console.log('--- Checking Products ---');
        const [prodCols] = await sequelize.query("SHOW COLUMNS FROM `Products` LIKE 'salt'");
        if (prodCols.length === 0) {
            console.log('Adding salt to Products...');
            await sequelize.query("ALTER TABLE `Products` ADD COLUMN `salt` VARCHAR(255) NULL;");
            console.log('✅ salt added.');
        } else {
            console.log('✓ salt exists.');
        }

        console.log('\n✅ All migrations checked/applied successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await sequelize.close();
    }
}

migrateVPS();
