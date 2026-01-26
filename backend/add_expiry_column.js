
const { sequelize } = require('./config/database');
const { DataTypes } = require('sequelize');

const addExpiryColumn = async () => {
    try {
        console.log('Ensuring expiry column in Products table...');
        const queryInterface = sequelize.getQueryInterface();

        try {
            // Try to add the column
            await queryInterface.addColumn('Products', 'expiry', {
                type: DataTypes.DATEONLY,
                allowNull: true
            });
            console.log('Successfully added expiry column (DATEONLY).');
        } catch (error) {
            // Check for duplicate column error
            if (error.original && (error.original.code === 'ER_DUP_FIELDNAME' || error.parent.code === 'ER_DUP_FIELDNAME')) {
                console.log('Column already exists. Modifying to DATEONLY...');
                try {
                    await queryInterface.changeColumn('Products', 'expiry', {
                        type: DataTypes.DATEONLY,
                        allowNull: true
                    });
                    console.log('Successfully modified expiry column type.');
                } catch (changeError) {
                    // Fallback: Sometimes changeColumn fails if types are weird. 
                    // Try raw SQL modification if Sequelize fails.
                    console.log('Sequelize changeColumn failed, attempting raw SQL...');
                    await sequelize.query("ALTER TABLE Products MODIFY COLUMN expiry DATE DEFAULT NULL;");
                    console.log('Successfully modified expiry column type (Raw SQL).');
                }
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Error updating column:', error);
    } finally {
        process.exit();
    }
};

addExpiryColumn();
