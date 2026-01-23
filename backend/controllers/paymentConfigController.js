const PaymentConfig = require('../models/PaymentConfig');
const { cloudinary } = require('../config/cloudinaryConfig');

// Helper to get or create the single config instance
const getConfigInstance = async () => {
    let config = await PaymentConfig.findOne();
    if (!config) {
        config = await PaymentConfig.create({});
    }
    return config;
};

// @desc    Get payment configuration (Admin)
// @route   GET /api/payment-config
// @access  Private/Admin
const getPaymentConfig = async (req, res) => {
    try {
        const config = await getConfigInstance();
        res.json(config);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update payment configuration
// @route   PUT /api/payment-config
// @access  Private/Admin
const updatePaymentConfig = async (req, res) => {
    try {
        const config = await getConfigInstance();

        const updates = { ...req.body };

        // Handle Image Upload
        if (req.file) {
            // Delete old image if exists
            if (config.qrCodePublicId) {
                try {
                    await cloudinary.uploader.destroy(config.qrCodePublicId);
                } catch (err) {
                    console.error("Failed to delete old QR code:", err);
                }
            }
            updates.qrCodeUrl = req.file.path;
            updates.qrCodePublicId = req.file.filename;
        }

        await config.update(updates);

        const updatedConfig = await PaymentConfig.findOne(); // Fetch fresh to return
        res.json(updatedConfig);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get payment configuration for Retailers
// @route   GET /api/payment-config/retailer
// @access  Private/Retailer or Public (depending on req)
const getRetailerPaymentConfig = async (req, res) => {
    try {
        const config = await getConfigInstance();

        // Construct the response based on business logic
        const response = {
            codEnabled: config.codEnabled,
            codNote: config.codEnabled ? config.codNote : null,

            advancePaymentEnabled: config.advancePaymentEnabled,
            advancePaymentInstruction: config.advancePaymentEnabled ? config.advancePaymentInstruction : null,

            // Only send Advance Payment details if enabled
            advancePaymentMethods: config.advancePaymentEnabled ? {
                upiQr: config.upiQrEnabled && {
                    enabled: config.upiQrEnabled,
                    upiId: config.upiId,
                    qrCodeUrl: config.qrCodeUrl
                },
                bankTransfer: config.bankTransferEnabled && {
                    enabled: config.bankTransferEnabled,
                    bankName: config.bankName,
                    accountNumber: config.accountNumber,
                    ifscCode: config.ifscCode,
                    accountHolderName: config.accountHolderName
                }
            } : null,

            // Discount info
            discount: (config.advancePaymentEnabled && config.advancePaymentDiscountEnabled) ? {
                enabled: true,
                type: config.discountType,
                value: config.discountValue,
                description: config.discountDescription
            } : {
                enabled: false
            }
        };

        res.json(response);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getPaymentConfig,
    updatePaymentConfig,
    getRetailerPaymentConfig
};
