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
        const { name, description, parentId } = req.body;
        const slug = createSlug(name);

        const existingCategory = await Category.findOne({ where: { slug } });
        if (existingCategory) {
            return res.status(400).json({ error: 'Category already exists' });
        }

        if (parentId) {
            const parent = await Category.findByPk(parentId);
            if (!parent) {
                return res.status(400).json({ error: 'Parent category not found' });
            }
        }

        const category = await Category.create({
            name,
            slug,
            description,
            parentId: parentId || null
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Helper to build category tree
const buildCategoryTree = (categories, parentId = null) => {
    const categoryList = [];
    let category;
    if (parentId == null) {
        category = categories.filter(cat => cat.parentId == null);
    } else {
        category = categories.filter(cat => cat.parentId == parentId);
    }

    for (let cat of category) {
        categoryList.push({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            isActive: cat.isActive,
            parentId: cat.parentId,
            createdAt: cat.createdAt,
            updatedAt: cat.updatedAt,
            subCategories: buildCategoryTree(categories, cat.id)
        });
    }
    return categoryList;
};

// Get All Categories
const getAllCategories = async (req, res) => {
    try {
        // Fetch all categories flat
        const categories = await Category.findAll();

        // Convert to plain objects (if not already)
        const plainCategories = categories.map(cat => cat.get({ plain: true }));

        // Build tree
        const categoryTree = buildCategoryTree(plainCategories);

        res.status(200).json(categoryTree);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Category by ID
const getCategoryById = async (req, res) => {
    try {
        const categoryId = parseInt(req.params.id);
        console.log(categoryId);
        const category = await Category.findByPk(categoryId);
        console.log(category);

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Fetch ALL categories to build the full tree
        // This is necessary because sub-categories might be deep
        const allCategories = await Category.findAll();
        console.log('allCategories', allCategories);

        const plainCategories = allCategories.map(cat => cat.get({ plain: true }));
        console.log('plainCategories', plainCategories);

        // Build the tree starting from this category's children
        const children = buildCategoryTree(plainCategories, categoryId);
        console.log('children', children);

        // Get the plain object of the requested category
        const result = category.get({ plain: true });
        console.log('result', result);

        // Attach the recursive children
        result.subCategories = children;

        // Optionally attach parent info (non-recursive for now, just direct parent)
        if (result.parentId) {
            const parent = await Category.findByPk(result.parentId);
            result.parent = parent;
        }
        console.log('result-final', result);

        res.status(200).json(result);
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

        // Check if there are sub-categories
        const subCategoryCount = await Category.count({
            where: { parentId: req.params.id }
        });

        if (subCategoryCount > 0) {
            return res.status(400).json({
                error: `Cannot delete category. It has ${subCategoryCount} sub-categories. Please delete them first.`
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
