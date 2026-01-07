const { Op } = require('sequelize');
const Product = require('../models/product');
const Category = require('../models/category');
const Retailer = require('../models/retailer');
const { cloudinary } = require('../config/cloudinaryConfig');
const { getDescendantCategoryIds } = require('../utils/categoryHelpers');
const xlsx = require('xlsx');

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
        const { search } = req.query;
        let queryOptions = {
            include: [{ model: Category }]
        };

        if (search) {
            queryOptions.where = {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { salt: { [Op.like]: `%${search}%` } },
                    { '$Category.name$': { [Op.like]: `%${search}%` } }
                ]
            };
        }

        // Check if user is a Retailer and filter permissions
        if (req.user && req.user.role === 'retailer') {
            const retailer = await Retailer.findOne({ where: { UserId: req.user.id } });
            if (retailer) {
                const allowedCategories = await retailer.getCategories();
                const allowedParentIds = allowedCategories.map(cat => cat.id);

                // Fetch ALL categories for recursive expansion
                const allCategories = await Category.findAll({ attributes: ['id', 'parentId'] });
                const plainAllCategories = allCategories.map(c => c.get({ plain: true }));

                // Expand to include children
                const expandedCategoryIds = getDescendantCategoryIds(plainAllCategories, allowedParentIds);

                // If using simple 'where', we might overwrite the search 'where'.
                // Need to merge them carefully.
                if (!queryOptions.where) queryOptions.where = {};

                // Op.and ensures both conditions must be met (Search + Permission)
                queryOptions.where = {
                    [Op.and]: [
                        queryOptions.where,
                        { CategoryId: { [Op.in]: expandedCategoryIds } }
                    ]
                };
            }
        }

        const products = await Product.findAll(queryOptions);
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

// Bulk Upload Products
// Bulk Upload Products
const bulkUploadProducts = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload an Excel file' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // 1. Read as Array of Arrays to inspect structure
        const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        if (rawData.length === 0) {
            return res.status(400).json({ error: 'Sheet is empty' });
        }

        // 2. Determine Header Row
        let headerRowIndex = 0;
        let categoryFromTitle = null;

        // Check if Row 0 is a Title (single cell or merged text like "ANTIBIOTICS...")
        const firstRow = rawData[0];
        if (firstRow && firstRow.length > 0 && typeof firstRow[0] === 'string') {
            // Heuristic: If Row 0 has "name" or "price", it's the header.
            // If not, it might be a Title.
            const rowString = JSON.stringify(firstRow).toLowerCase();
            if (!rowString.includes('name') && !rowString.includes('price')) {
                // Likely a Title Row
                categoryFromTitle = firstRow[0].trim();
                headerRowIndex = 1; // Assume headers are on Row 2 (Index 1)

                // Verify Row 1 has headers
                const secondRow = rawData[1];
                if (!secondRow || !JSON.stringify(secondRow).toLowerCase().includes('name')) {
                    // Try to search for the header row
                    headerRowIndex = rawData.findIndex(row =>
                        row && JSON.stringify(row).toLowerCase().includes('name')
                    );
                    if (headerRowIndex === -1) return res.status(400).json({ error: 'Could not find header row containing "name"' });
                }
            }
        }

        // 3. Find or Create Category from Title (if applicable)
        let inferredCategoryId = null;
        if (categoryFromTitle) {
            // Clean up title (remove special chars if needed)
            // e.g. "ANTIBIOTICS, ANTI-HELMINTHICS & ANTI VIRALS"
            let category = await Category.findOne({ where: { name: categoryFromTitle } });
            if (!category) {
                // Determine Logic: Create if not exists? Yes, for bulk upload convenience.
                try {
                    category = await Category.create({
                        name: categoryFromTitle,
                        slug: categoryFromTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                    });
                } catch (catErr) {
                    // Fallback if slug collision or validation error
                    console.error("Auto-create category failed:", catErr.message);
                }
            }
            if (category) inferredCategoryId = category.id;
        }

        // 4. Parse Data with correct Header Row
        const rows = xlsx.utils.sheet_to_json(sheet, { range: headerRowIndex });

        let successCount = 0;
        let failedCount = 0;
        let errors = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNumber = i + headerRowIndex + 2; // Adjust for 0-index + 1 + skipped rows

            try {
                // Normalize keys (handle Name vs name)
                const name = row.Name || row.name || row['product name'];
                let price = row.Price || row.price || row['MRP'] || row['PTR']; // Fallback to other potential price columns

                // User-Specific Columns Mapping
                // Composition + Dosage | Packing
                let descriptionParts = [];
                if (row.Composition) descriptionParts.push(`Composition: ${row.Composition}`);
                if (row.Dosage) descriptionParts.push(`Dosage: ${row.Dosage}`);
                if (row.Packing) descriptionParts.push(`Packing: ${row.Packing}`);
                if (row.COMPONY || row.Company) descriptionParts.push(`Company: ${row.COMPONY || row.Company}`);
                if (row.Description) descriptionParts.push(row.Description);

                const finalDescription = descriptionParts.join(' | ');

                const stock = row.Stock || row.stock;
                const salt = row.Salt || row.salt;

                // Category Logic: Row specific > Title inferred
                const categoryId = row.CategoryId || row.categoryId || row['Category Id'] || inferredCategoryId;

                // SKIP SECTION HEADERS -> SWITCH TO CATEGORY
                // Check if Price, Packing, Composition are effectively empty
                // Helper to check if a value is "empty" (null, undefined, whitespace, 0, -, .)
                const isEmpty = (val) => {
                    if (!val) return true; // null, undefined, 0, false, ""
                    if (typeof val === 'string') {
                        const trimmed = val.trim();
                        return trimmed === '' || trimmed === '-' || trimmed === '.' || trimmed === '0';
                    }
                    if (typeof val === 'number') return val === 0;
                    return false;
                };

                const isPriceEmpty = isEmpty(price);
                const isPackingEmpty = isEmpty(row.Packing);
                const isCompositionEmpty = isEmpty(row.Composition);

                if (name && isPriceEmpty && isPackingEmpty && isCompositionEmpty) {
                    // This is a Category Row (e.g., "INJECTABLES")
                    const sectionName = name.trim();

                    // Create/Find this Category
                    let sectionCategory = await Category.findOne({ where: { name: sectionName } });
                    if (!sectionCategory) {
                        sectionCategory = await Category.create({
                            name: sectionName,
                            slug: sectionName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                            parentId: inferredCategoryId // Corrected variable name
                        });
                    }

                    currentSectionCategoryId = sectionCategory.id;
                    continue; // Done with this row
                }

                // Validate
                if (!name) throw new Error('Product Name is required (Column: name)');
                if (!price) throw new Error('Price is required (Column: price)');
                if (!categoryId) throw new Error(`Category ID is required. Title '${categoryFromTitle}' could not be mapped.`);

                // Check Duplicates
                const existingProduct = await Product.findOne({ where: { name: name } });
                if (existingProduct) throw new Error('Product already exists');

                // Create Product
                await Product.create({
                    name: name,
                    description: finalDescription,
                    price: parseFloat(price), // Ensure number
                    stock: stock ? parseInt(stock) : 0,
                    salt: salt || null,
                    CategoryId: categoryId,
                    imageUrl: '',
                    publicId: ''
                });

                successCount++;

            } catch (err) {
                failedCount++;
                errors.push({ row: rowNumber, name: row.Name || row.name || 'Unknown', error: err.message });
            }
        }

        let statusCode = 200;
        if (successCount === 0 && failedCount > 0) statusCode = 400;

        res.status(statusCode).json({
            message: successCount === 0 ? 'Bulk upload failed' : 'Bulk upload completed',
            total: rows.length,
            success: successCount,
            failed: failedCount,
            errors: errors,
            inferredCategory: categoryFromTitle // Info for user
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete All Products
const deleteAllProducts = async (req, res) => {
    try {
        await Product.destroy({ where: {}, truncate: true });
        res.status(200).json({ message: 'All products have been deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    bulkUploadProducts,
    deleteAllProducts
};
