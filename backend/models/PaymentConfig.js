const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PaymentConfig = sequelize.define('PaymentConfig', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // COD Settings
    codEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },

    codNote: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Pay cash upon delivery.'
    },

    // Advance Payment Settings
    advancePaymentEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    advancePaymentInstruction: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: 'Please share the payment screenshot with your Order ID on WhatsApp after payment.'
    },

    // Sub-settings for Advance Payment
    upiQrEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    bankTransferEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },

    // Bank Details
    bankName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    accountNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    ifscCode: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    accountHolderName: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    // UPI/QR Details
    upiId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    qrCodeUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    qrCodePublicId: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    // Discount Settings
    advancePaymentDiscountEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    discountType: {
        type: DataTypes.ENUM('FLAT', 'PERCENT'),
        defaultValue: 'PERCENT',
    },
    discountValue: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    discountDescription: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    timestamps: true,
});

module.exports = PaymentConfig;
