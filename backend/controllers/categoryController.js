const Category = require('../models/category');
const Product = require('../models/product');

// Helper to create slug
const createSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
};

// Create Category
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const slug = createSlug(name);

        const existingCategory = await Category.findOne({ where: { slug } });
        if (existingCategory) {
            return res.status(400).json({ error: 'Category already exists' });
        }

        const category = await Category.create({
            name,
            slug,
            description
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Category by ID
const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (category) {
            res.status(200).json(category);
        } else {
            res.status(404).json({ error: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Category
const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const { name, description, isActive } = req.body;
        let updateData = { description, isActive };

        if (name) {
            updateData.name = name;
            updateData.slug = createSlug(name);
        }

        await category.update(updateData);
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Category
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Check if there are any products in this category
        const productCount = await Product.count({
            where: { CategoryId: req.params.id }
        });

        if (productCount > 0) {
            return res.status(400).json({
                error: `Cannot delete category. It contains ${productCount} products. Please delete or move them first.`
            });
        }

        await category.destroy();
        res.status(200).json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};
