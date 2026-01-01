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
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    publicId: {
        type: DataTypes.STRING,
        allowNull: false,
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
