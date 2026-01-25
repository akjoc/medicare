const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending',
    },
    address: {
        type: DataTypes.TEXT, // Store full address as string or JSON
        allowNull: false
    },
    totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    subTotal: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    discount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    deliveryFee: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    paymentMethod: {
        type: DataTypes.ENUM('COD', 'ONLINE'),
        allowNull: false,
    },
    paymentStatus: {
        type: DataTypes.ENUM('pending', 'paid', 'failed'),
        defaultValue: 'pending',
    },
    orderDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    retailerName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    shopName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    couponCode: {
        type: DataTypes.STRING,
        allowNull: true
    },
    couponDiscount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    paymentDiscount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    }
}, {
    timestamps: true
});

module.exports = Order;
