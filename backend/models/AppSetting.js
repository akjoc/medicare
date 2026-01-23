const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AppSetting = sequelize.define('AppSetting', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    appName: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Health Harbour'
    },
    appTagline: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'B2B Medicine Ordering'
    },
    whatsappNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    supportNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    gstNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    timestamps: true,
});

module.exports = AppSetting;
