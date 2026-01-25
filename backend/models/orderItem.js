const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 }
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        comment: 'Price per unit at the time of purchase'
    }
}, {
    timestamps: true
});

module.exports = OrderItem;
