const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Coupon = sequelize.define('Coupon', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        set(value) {
            this.setDataValue('code', value.toUpperCase());
        }
    },
    type: {
        type: DataTypes.ENUM('flat', 'percent'),
        allowNull: false,
    },
    value: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    shortDescription: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    usageLimit: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    usageCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    // Storing as JSON array for flexibility
    categoryIds: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    // Storing as JSON array for flexibility 
    retailerIds: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    }
}, {
    timestamps: true
});

module.exports = Coupon;
