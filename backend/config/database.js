const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();
dotenv.config({ path: '.env.local' });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false, // Set to console.log to see SQL queries
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Database connected successfully to: ${process.env.DB_NAME} on ${process.env.DB_HOST}`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, connectDB };
