const Product = require('../models/product');
const Category = require('../models/category');
const { cloudinary } = require('../config/cloudinaryConfig');

// Create Product
const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, categoryId, salt } = req.body;

        // Check if file is uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload an image' });
        }

        // Check if category provided
        if (!categoryId) {
            // Delete the uploaded image since we are not going to save the product
            await cloudinary.uploader.destroy(req.file.filename);
            return res.status(400).json({ error: 'Please provide a categoryId' });
        }

        // Check if product with same name exists
        const existingProduct = await Product.findOne({ where: { name } });
        if (existingProduct) {
            // Delete the uploaded image since we are not going to save the product
            await cloudinary.uploader.destroy(req.file.filename);
            return res.status(400).json({ error: 'Product with this name already exists' });
        }

        const product = await Product.create({
            name,
            description,
            price,
            stock,
            salt,
            CategoryId: categoryId,
            imageUrl: req.file.path, // Cloudinary URL
            publicId: req.file.filename // Cloudinary Public ID
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Products
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Product by ID
const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Product
const updateProduct = async (req, res) => {
    try {
        const { name, description, price, stock, categoryId, salt } = req.body;
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        let updatedData = {
            name,
            description,
            price,
            stock,
            salt
        };

        if (categoryId) {
            updatedData.CategoryId = categoryId;
        }

        // If a new image is uploaded
        if (req.file) {
            // 1. Delete old image from Cloudinary
            if (product.publicId) {
                await cloudinary.uploader.destroy(product.publicId);
            }

            // 2. Add new image data
            updatedData.imageUrl = req.file.path;
            updatedData.publicId = req.file.filename;
        }

        await product.update(updatedData);

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Product
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // 1. Delete image from Cloudinary
        if (product.publicId) {
            await cloudinary.uploader.destroy(product.publicId);
        }

        // 2. Delete from DB
        await product.destroy();

        res.status(200).json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
