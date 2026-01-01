const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Blacklist = sequelize.define('Blacklist', {
    token: {
        type: DataTypes.STRING(500), // Tokens can be long
        allowNull: false,
    },
    expiresAt: {
        type: DataTypes.DATE, // To know when we can auto-delete it
        allowNull: false,
    }
}, {
    timestamps: true
});

module.exports = Blacklist;
