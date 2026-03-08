const Category = require('../models/category');
const Product = require('../models/product');
const Retailer = require('../models/retailer');
const Company = require('../models/company');
const { getDescendantCategoryIds } = require('../utils/categoryHelpers');

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
// Helper to build category tree
const buildCategoryTree = (categories, parentId = null) => {
    const categoryList = [];
    let category;

    // If parentId is explicitly null, we want global roots.
    // BUT, if we have a filtered list (e.g. for a retailer), 
    // a "root" in this context is any category whose parent is NOT in the list.
    if (parentId == null) {
        // Find all IDs currently in the list
        const allIds = new Set(categories.map(c => c.id));

        // A category is a "root" to display if:
        // 1. It has no parent (global root)
        // 2. OR its parent exists but is NOT in our filtered list (orphaned sub-tree)
        category = categories.filter(cat =>
            cat.parentId == null || !allIds.has(cat.parentId)
        );
    } else {
        // Normal recursion: find children of the specific parent
        category = categories.filter(cat => cat.parentId == parentId);
    }

    for (let cat of category) {
        // Prevent infinite recursion if data is bad, though logic above prevents it mostly
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
        let whereClause = {};

        // Check if user is a Retailer and filter permissions
        if (req.user && req.user.role === 'retailer') {
            const retailer = await Retailer.findOne({ where: { UserId: req.user.id } });
            if (retailer) {
                const allowedCategories = await retailer.getCategories();

                // Logic Change: If retailer has NO assigned categories, they see ALL categories.
                // Only filter if they actually have assignments.
                if (allowedCategories && allowedCategories.length > 0) {
                    const allowedParentIds = allowedCategories.map(cat => cat.id);

                    // Fetch ALL categories for recursive expansion
                    // Note: We need all categories anyway to check descendants. 
                    // We should optimistically fetch everything once if the DB isn't huge, which is what getAllCategories does anyway implicitly?
                    // Actually getAllCategories fetches 'categories' flat later. We can reuse that if we reorder logic.
                    // But let's stick to explicit robust expansion.
                    const allCats = await Category.findAll({ attributes: ['id', 'parentId'] });
                    const plainAllCats = allCats.map(c => c.get({ plain: true }));

                    const expandedCategoryIds = getDescendantCategoryIds(plainAllCats, allowedParentIds);

                    whereClause = { id: expandedCategoryIds };
                }
            }
        }

        // Fetch categories flat
        const categories = await Category.findAll({ where: whereClause });

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
        const category = await Category.findByPk(categoryId);

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Fetch ALL categories to build the full tree
        // This is necessary because sub-categories might be deep
        const allCategories = await Category.findAll();

        const plainCategories = allCategories.map(cat => cat.get({ plain: true }));

        // Build the tree starting from this category's children
        const children = buildCategoryTree(plainCategories, categoryId);

        // Get the plain object of the requested category
        const result = category.get({ plain: true });

        // Attach the recursive children
        result.subCategories = children;

        // Optionally attach parent info (non-recursive for now, just direct parent)
        if (result.parentId) {
            const parent = await Category.findByPk(result.parentId);
            result.parent = parent;
        }

        // Fetch products for this category and all its descendants
        const descendantIds = getDescendantCategoryIds(plainCategories, [categoryId]);
        const allRelevantCategoryIds = [categoryId, ...descendantIds];

        const products = await Product.findAll({
            include: [
                {
                    model: Category,
                    where: { id: allRelevantCategoryIds },
                    through: { attributes: [] }
                },
                {
                    model: Company,
                    attributes: ['id', 'name', 'status']
                }
            ]
        });

        // Clean up internal category junction data from products if needed
        const cleanProducts = products.map(p => {
            const plainProduct = p.get({ plain: true });
            if (plainProduct.Categories) delete plainProduct.Categories;
            return plainProduct;
        });

        result.products = cleanProducts;
        result.totalProducts = cleanProducts.length;

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

        const { name, description, isActive, parentId } = req.body;
        let updateData = { description, isActive };

        if (parentId !== undefined) {
            // Prevent Self-Parenting
            if (parseInt(parentId) === category.id) {
                return res.status(400).json({ error: 'A category cannot be its own parent.' });
            }

            // Prevent Circular Dependency (Parent cannot be a child of this category)
            // 1. Get all categories to trace descendants
            const allCategories = await Category.findAll();
            const plainCategories = allCategories.map(c => c.get({ plain: true }));

            // 2. Find all descendants of the *current* category
            const descendantIds = getDescendantCategoryIds(plainCategories, [category.id]);

            // 3. Check if the new parentId is one of the descendants
            if (descendantIds.includes(parseInt(parentId))) {
                return res.status(400).json({ error: 'Circular dependency detected. You cannot move a category into its own child.' });
            }

            updateData.parentId = parentId;
        }

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
                error: `Cannot delete category.It contains ${productCount} products.Please delete or move them first.`
            });
        }

        // Check if there are sub-categories
        const subCategoryCount = await Category.count({
            where: { parentId: req.params.id }
        });

        if (subCategoryCount > 0) {
            return res.status(400).json({
                error: `Cannot delete category.It has ${subCategoryCount} sub - categories.Please delete them first.`
            });
        }

        await category.destroy();
        res.status(200).json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete All Categories
const deleteAllCategories = async (req, res) => {
    try {
        // Destroy all categories
        // Note: Using truncate: true might fail if there are foreign key constraints (like parentId) checks enabled in some DB configs 
        // without CASCADE. However, Sequelize destroy with truncate usually handles it if configured, 
        // or we can use where: {}. 
        // Given self-referencing relationship, a simple destroy might face constraint issues if parents are deleted before children.
        // But 'truncate: true' with 'cascade: true' (if supported) or disabling checks is often needed.
        // For simplicity in this dev environment:
        await Category.destroy({ where: {}, truncate: { cascade: true } });

        // If the above fails due to FK constraints on some dialects without specific options:
        // await Category.destroy({ where: {}, force: true }); 

        res.status(200).json({ message: 'All categories have been deleted successfully' });
    } catch (error) {
        // Fallback for foreign key constraint errors
        try {
            // If simple truncate fails, try disabling checks temporarily or just deleting
            await Category.destroy({ where: {} });
            res.status(200).json({ message: 'All categories have been deleted successfully' });
        } catch (retryError) {
            res.status(500).json({ error: retryError.message });
        }
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    deleteAllCategories
};
