const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductCategory = sequelize.define('ProductCategory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ProductId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Products', // Ensure this matches table name
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    CategoryId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Categories', // Ensure this matches table name
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    }
}, {
    timestamps: false
});

module.exports = ProductCategory;
