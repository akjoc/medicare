const multer = require('multer');

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use Memory Storage for processing files in memory (like Excel)
const storage = multer.memoryStorage();
const uploadFile = multer({ storage: storage });

// Invoice Storage (PDF only, medicare_invoices folder)
const invoiceStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'medicare_invoices',
        allowed_formats: ['pdf'],
        resource_type: 'auto' // Important for PDFs
    }
});

const uploadInvoice = multer({ storage: invoiceStorage });

module.exports = {
    uploadFile,
    uploadInvoice
};
