const { sequelize } = require('./config/database');

async function check() {
    try {
        const [results] = await sequelize.query("DESCRIBE AppSettings");
        console.log(JSON.stringify(results, null, 2));
    } catch (error) {
        console.error('Error describing table:', error.message);
    } finally {
        process.exit();
    }
}

check();
