const { sequelize } = require('./config/database');
const Company = require('./models/company');
const Product = require('./models/product');
const { DataTypes } = require('sequelize');

const migrateCompanies = async () => {
    try {
        console.log('Starting Company Migration...');

        // 1. Sync Company Model (Create Table)
        await Company.sync();
        console.log('Companies table synced.');

        // 2. Add companyId column to Products if not exists
        const queryInterface = sequelize.getQueryInterface();
        const tableDescription = await queryInterface.describeTable('Products');

        if (!tableDescription.companyId) {
            await queryInterface.addColumn('Products', 'companyId', {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'Companies',
                    key: 'id',
                }
            });
            console.log('Added companyId column to Products table.');
        } else {
            console.log('companyId column already exists in Products table.');
        }

        // 3. Migrate Data
        const products = await Product.findAll();
        console.log(`Found ${products.length} products to check for migration.`);

        let newCompaniesCount = 0;
        let productsUpdatedCount = 0;

        for (const product of products) {
            const companyData = product.companies;

            // Check if there is company data and it's an array with at least one item
            if (companyData && Array.isArray(companyData) && companyData.length > 0) {
                // Ensure it's a string
                let rawName = companyData[0];
                if (!rawName) continue; // Skip if null/undefined

                const companyName = String(rawName).trim(); // Cast to string safe

                if (companyName) {
                    // Find or Create Company
                    const [company, created] = await Company.findOrCreate({
                        where: { name: companyName },
                        defaults: { status: 'active' }
                    });

                    if (created) newCompaniesCount++;

                    // Update Product with companyId
                    product.companyId = company.id;
                    await product.save();
                    productsUpdatedCount++;
                }
            } else if (typeof companyData === 'string' && companyData.trim().length > 0) {
                // Handle legacy string case just in case
                const companyName = companyData.trim();
                const [company, created] = await Company.findOrCreate({
                    where: { name: companyName },
                    defaults: { status: 'active' }
                });

                if (created) newCompaniesCount++;

                product.companyId = company.id;
                await product.save();
                productsUpdatedCount++;
            }
        }

        console.log(`Migration Complete.`);
        console.log(`New Companies Created: ${newCompaniesCount}`);
        console.log(`Products Linked: ${productsUpdatedCount}`);

        process.exit(0);
    } catch (error) {
        console.error('Migration Failed:', error);
        process.exit(1);
    }
};

migrateCompanies();
