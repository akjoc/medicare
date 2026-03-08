const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'medicare_products', // Folder in Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});

const upload = multer({ storage: storage });

/**
 * Upload PDF buffer to Cloudinary
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @param {string} fileName - Name for the PDF file
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadPDFToCloudinary = async (pdfBuffer, fileName) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'invoices',
                resource_type: 'raw',
                public_id: fileName,
                format: 'pdf'
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        // Write buffer to stream
        uploadStream.end(pdfBuffer);
    });
};

module.exports = { cloudinary, upload, uploadPDFToCloudinary };
