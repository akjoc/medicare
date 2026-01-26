
const { sequelize } = require('./config/database');
const { DataTypes } = require('sequelize');

const addExpiryColumn = async () => {
    try {
        console.log('Adding expiry column to Products table...');
        const queryInterface = sequelize.getQueryInterface();

        await queryInterface.addColumn('Products', 'expiry', {
            type: DataTypes.DATEONLY,
            allowNull: true
        });

        console.log('Successfully added expiry column.');
    } catch (error) {
        console.error('Error adding column:', error);
    } finally {
        process.exit();
    }
};

addExpiryColumn();
