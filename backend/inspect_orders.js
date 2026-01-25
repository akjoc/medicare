const { sequelize } = require('./config/database');

const inspectTable = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const [results, metadata] = await sequelize.query('DESCRIBE Orders');
        console.log('Orders Table Schema:', results);

        process.exit(0);
    } catch (error) {
        console.error('Inspection failed:', error);
        process.exit(1);
    }
};

inspectTable();
