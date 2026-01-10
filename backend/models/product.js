const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Category = require('./category');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // ... (existing fields)
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    buyingPrice: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    salePrice: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    companies: {
        type: DataTypes.JSON, // Array of strings
        defaultValue: [],
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    salt: {
        type: DataTypes.JSON, // MySQL stores arrays as JSON
        allowNull: true,
        defaultValue: [] // Default to empty array
    },
    imageUrls: {
        type: DataTypes.JSON, // Array of strings
        allowNull: false,
        defaultValue: []
    },
    publicIds: {
        type: DataTypes.JSON, // Array of strings
        allowNull: false,
        defaultValue: []
    },
    CategoryId: {
        type: DataTypes.INTEGER,
        references: {
            model: Category,
            key: 'id',
        }
    }
}, {
    timestamps: true
});

Product.belongsTo(Category);
Category.hasMany(Product);

module.exports = Product;
