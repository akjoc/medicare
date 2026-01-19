const { sequelize } = require('./config/database');

const removeColumn = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log("Attempting to drop column 'imageurl'...");
        try {
            await sequelize.query("ALTER TABLE Products DROP COLUMN imageurl;");
            console.log("Column 'imageurl' dropped successfully.");
        } catch (e) {
            console.log("Error dropping column (it might not exist):", e.message);
        }

        process.exit(0);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

removeColumn();
