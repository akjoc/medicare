const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');


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
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow null initially for migration
        references: {
            model: 'Companies', // Table name
            key: 'id',
        }
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
        allowNull: true,
        defaultValue: []
    },
    publicIds: {
        type: DataTypes.JSON, // Array of strings
        allowNull: false,
        defaultValue: []
    },
    // categoryId: { // DEPRECATED: Moving to Many-to-Many
    //     type: DataTypes.INTEGER,
    //     references: {
    //         model: Category,
    //         key: 'id'
    //     },
    //     onDelete: 'SET NULL',
    //     onUpdate: 'CASCADE'
    // },
    dosage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    packing: {
        type: DataTypes.STRING,
        allowNull: true
    },
    expiry: {
        type: DataTypes.DATE, // or DATEONLY if time isn't needed, but DATE is standard
        allowNull: true
    }
}, {
    timestamps: true
});



module.exports = Product;
