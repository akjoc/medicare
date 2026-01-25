const { sequelize } = require('./config/database');
const { DataTypes } = require('sequelize');
const Company = require('./models/company');
const Product = require('./models/product');

const runMigration = async () => {
    try {
        console.log('Starting Server Setup & Migration...');
        await sequelize.authenticate();
        console.log('Database Connected.');

        const queryInterface = sequelize.getQueryInterface();

        // 1. Sync Companies Table
        await Company.sync();
        console.log('Checked Companies table.');

        // 2. Add companyId to Products
        const productTable = await queryInterface.describeTable('Products');
        if (!productTable.companyId) {
            console.log('Adding companyId to Products...');
            await queryInterface.addColumn('Products', 'companyId', {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'Companies',
                    key: 'id',
                }
            });
        } else {
            console.log('Products.companyId exists.');
        }

        // 3. Add rating/review to Orders
        const orderTable = await queryInterface.describeTable('Orders');
        if (!orderTable.rating) {
            console.log('Adding rating to Orders...');
            await queryInterface.addColumn('Orders', 'rating', {
                type: DataTypes.INTEGER,
                allowNull: true,
                validate: { min: 1, max: 5 }
            });
        } else {
            console.log('Orders.rating exists.');
        }

        if (!orderTable.review) {
            console.log('Adding review to Orders...');
            await queryInterface.addColumn('Orders', 'review', {
                type: DataTypes.TEXT,
                allowNull: true
            });
        } else {
            console.log('Orders.review exists.');
        }

        // 4. Migrate Company Data (Robust)
        console.log('Checking Company Data Migration...');
        const products = await Product.findAll();
        let migratedCount = 0;

        for (const product of products) {
            if (product.companyId) continue; // Already linked

            const companyData = product.companies;
            let companyName = null;

            if (companyData && Array.isArray(companyData) && companyData.length > 0) {
                if (companyData[0] && typeof companyData[0] === 'string') {
                    companyName = companyData[0].trim();
                }
            } else if (typeof companyData === 'string' && companyData.trim().length > 0) {
                companyName = companyData.trim();
            }

            if (companyName) {
                const [company] = await Company.findOrCreate({
                    where: { name: companyName },
                    defaults: { status: 'active' }
                });
                product.companyId = company.id;
                await product.save();
                migratedCount++;
            }
        }
        console.log(`Linked ${migratedCount} products to companies.`);

        console.log('Server Setup Complete. You can now restart the server.');
        process.exit(0);

    } catch (error) {
        console.error('Setup Failed:', error);
        process.exit(1);
    }
};

runMigration();
