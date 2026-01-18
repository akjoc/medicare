const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const Product = require('../models/product');
const Category = require('../models/category');
const Retailer = require('../models/retailer');
const { cloudinary } = require('../config/cloudinaryConfig');
const { getDescendantCategoryIds } = require('../utils/categoryHelpers');
const xlsx = require('xlsx');

// Helper to clean response
const getCleanProduct = (productInstance) => {
    if (!productInstance) return null;
    const plain = productInstance.get ? productInstance.get({ plain: true }) : productInstance;
    if (plain.CategoryId !== undefined) delete plain.CategoryId;
    if (plain.publicIds !== undefined) delete plain.publicIds;
    return plain;
};

// Create Product
const createProduct = async (req, res) => {
    try {
        const { name, description, price, buyingPrice, salePrice, companies, stock, categoryId, categoryIds, salt, sku, dosage, packing } = req.body;

        // Check if category provided (Handle single or array)
        let targetCategoryIds = [];
        if (categoryIds && Array.isArray(categoryIds)) {
            targetCategoryIds = categoryIds;
        } else if (categoryId) {
            targetCategoryIds = Array.isArray(categoryId) ? categoryId : [categoryId];
        }

        if (targetCategoryIds.length === 0) {
            // Delete uploaded images
            if (req.files) {
                for (const file of req.files) {
                    await cloudinary.uploader.destroy(file.filename);
                }
            }
            return res.status(400).json({ error: 'Please provide categoryIds (array) or categoryId' });
        }

        // Validate Categories Exist
        const validCategoriesCount = await Category.count({ where: { id: targetCategoryIds } });
        if (validCategoriesCount !== targetCategoryIds.length) {
            if (req.files) {
                for (const file of req.files) {
                    await cloudinary.uploader.destroy(file.filename);
                }
            }
            return res.status(400).json({ error: 'One or more categories not found' });
        }

        // Check if product with same name exists
        const existingProduct = await Product.findOne({ where: { name } });
        if (existingProduct) {
            if (req.files) {
                for (const file of req.files) {
                    await cloudinary.uploader.destroy(file.filename);
                }
            }
            return res.status(400).json({ error: 'Product with this name already exists' });
        }

        // Check if SKU exists
        const existingSku = await Product.findOne({ where: { sku } });
        if (existingSku) {
            if (req.files) {
                for (const file of req.files) {
                    await cloudinary.uploader.destroy(file.filename);
                }
            }
            return res.status(400).json({ error: 'Product with this SKU already exists' });
        }

        // Check if files are uploaded (Optional now)
        // If NO files, use the Default Image
        let imageUrls = [];
        let publicIds = [];

        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(file => file.path);
            publicIds = req.files.map(file => file.filename);
        } else {
            imageUrls = ["https://res.cloudinary.com/dhvch5umt/image/upload/v1768724782/medical-equipments-500x500_ul7oua.webp"];
            publicIds = []; // No public ID for external/default image
        }

        // Helper to parse potential JSON or single string
        const parseArrayField = (field) => {
            if (!field) return [];
            try {
                return JSON.parse(field);
            } catch (e) {
                return [field];
            }
        };

        const product = await Product.create({
            name,
            sku,
            description,
            price,
            buyingPrice,
            salePrice,
            companies: parseArrayField(companies),
            stock,
            salt: parseArrayField(salt),

            // CategoryId: categoryId, // Deprecated
            imageUrls: imageUrls, // Store array
            publicIds: publicIds, // Store array
            dosage, // Add Dosage
            packing // Add Packing
        });

        if (targetCategoryIds.length > 0) {
            await product.setCategories(targetCategoryIds);
        }

        // Fetch fresh product with categories
        // Fetch fresh product with categories
        const freshProduct = await Product.findByPk(product.id, {
            include: {
                model: Category,
                through: { attributes: [] }
            }
        });
        res.status(201).json(getCleanProduct(freshProduct));
    } catch (error) {
        console.error("Create Product Error:", error);
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
        }
        res.status(500).json({ error: error.message });
    }
};

// Get All Products
const getAllProducts = async (req, res) => {
    try {
        const { search, page = 1 } = req.query;
        const limit = 26;
        const offset = (page - 1) * limit;

        let queryOptions = {
            include: [{
                model: Category,
                through: { attributes: [] }
            }],
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            subQuery: false // IMPORTANT: Required when filtering by associated model (Category name) with limit/offset
        };

        if (search) {
            queryOptions.where = {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    // Fix: Cast JSON columns to CHAR for LIKE search
                    sequelize.where(sequelize.fn('LOWER', sequelize.cast(sequelize.col('salt'), 'CHAR')), { [Op.like]: `%${search.toLowerCase()}%` }),
                    sequelize.where(sequelize.fn('LOWER', sequelize.cast(sequelize.col('companies'), 'CHAR')), { [Op.like]: `%${search.toLowerCase()}%` }),
                    { '$Category.name$': { [Op.like]: `%${search}%` } }
                ]
            };
        }

        // Check if user is a Retailer and filter permissions
        if (req.user && req.user.role === 'retailer') {
            const retailer = await Retailer.findOne({ where: { UserId: req.user.id } });
            if (retailer) {
                const allowedCategories = await retailer.getCategories();

                // If Retailer has NO assigned categories, they get FULL ACCESS (Design Decision)
                if (allowedCategories && allowedCategories.length > 0) {
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
                // Else: Do nothing, let them see all products
            }
        }

        const { count, rows } = await Product.findAndCountAll(queryOptions);

        // Sanitize response: Remove 'CategoryId' (uppercase) if 'categoryId' (lowercase) exists or just cleanup
        const cleanRows = rows.map(p => {
            const plain = p.get({ plain: true });
            if (plain.CategoryId !== undefined) delete plain.CategoryId;
            if (plain.publicIds !== undefined) delete plain.publicIds; // Remove publicIds
            // Ensure lowercase categoryId is present if missing (optional, but good for consistency)
            // if (!plain.categoryId && plain.CategoryId) plain.categoryId = plain.CategoryId; 
            return plain;
        });

        res.status(200).json({
            products: cleanRows,
            totalProducts: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Product by ID
const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: {
                model: Category,
                through: { attributes: [] } // Exclude junction table data
            }
        });
        if (product) {
            res.status(200).json(getCleanProduct(product));
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
        const { name, description, price, buyingPrice, salePrice, companies, stock, salt, sku, dosage, packing, categoryIds } = req.body;
        // Handle both camelCase and PascalCase for categoryId
        const categoryId = req.body.categoryId || req.body.CategoryId;

        const product = await Product.findByPk(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Helper to parse potential JSON or single string (Re-declared for scope, or moving to helper file would be better, but inline for now to avoid large diffs)
        const parseArrayField = (field) => {
            if (field === undefined) return undefined; // Don't update if not provided
            if (field === null) return [];
            try {
                return JSON.parse(field);
            } catch (e) {
                return [field];
            }
        };

        let updatedData = {
            name,
            sku,
            description,
            price,
            buyingPrice,
            salePrice,
            companies: parseArrayField(companies),
            stock,
            salt: parseArrayField(salt),
            dosage, // Add Dosage
            packing // Add Packing
        };

        // Handle Categories Update
        if (categoryIds || categoryId) {
            let targetCategoryIds = [];
            if (categoryIds && Array.isArray(categoryIds)) {
                targetCategoryIds = categoryIds;
            } else if (categoryId) {
                targetCategoryIds = Array.isArray(categoryId) ? categoryId : [categoryId];
            }

            // Validate
            const validCategoriesCount = await Category.count({ where: { id: targetCategoryIds } });
            if (validCategoriesCount !== targetCategoryIds.length) {
                return res.status(400).json({ error: 'One or more categories not found' });
            }

            await product.setCategories(targetCategoryIds);
        }

        // If new images are uploaded, replace old ones (Strategy: Replace All)
        if (req.files && req.files.length > 0) {
            // 1. Delete old images from Cloudinary
            if (product.publicIds && Array.isArray(product.publicIds)) {
                for (const pid of product.publicIds) {
                    await cloudinary.uploader.destroy(pid);
                }
            } else if (product.publicId) {
                // Legacy support if migration messed up
                await cloudinary.uploader.destroy(product.publicId);
            }

            // 2. Add new image data
            updatedData.imageUrls = req.files.map(file => file.path);
            updatedData.publicIds = req.files.map(file => file.filename);
        }

        await product.update(updatedData);

        // Fetch fresh instance (optional, but good for clean response)
        // Or just clean the updated instance
        const updatedProduct = await Product.findByPk(req.params.id, {
            include: {
                model: Category,
                through: { attributes: [] }
            }
        });
        res.status(200).json(getCleanProduct(updatedProduct));
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

        // 1. Delete images from Cloudinary
        if (product.publicIds && Array.isArray(product.publicIds)) {
            for (const pid of product.publicIds) {
                await cloudinary.uploader.destroy(pid);
            }
        } else if (product.publicId) {
            // Legacy
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
        let currentSectionCategoryId = null; // Declare here

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNumber = i + headerRowIndex + 2;

            try {
                // Normalize keys & Handle User-Specific Columns
                const name = row.Name || row.name || row['product name'];

                // SKU Logic: User provided or Auto-generate
                let sku = row.sku || row.SKU || row.Sku;
                if (!sku) {
                    // Auto-generate: SKU-TIMESTAMP-RANDOM
                    sku = `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                }

                // Helper to clean price: "13.35/amp." -> 13.35
                const cleanPrice = (val) => {
                    if (!val) return null;
                    if (typeof val === 'number') return val;
                    const match = String(val).match(/[0-9]+(\.[0-9]+)?/);
                    return match ? parseFloat(match[0]) : null;
                };

                let rawPrice = row.price || row.Price || row['MRP'];
                let rawBuyingPrice = row['Buying Price'] || row['buying price'];
                let rawSalePrice = row['sale price'] || row['Sale price'] || row['price_1'] || row['Price_1'] || row['Sale Price'] || row['selling price'];

                let price = cleanPrice(rawPrice);
                let buyingPrice = cleanPrice(rawBuyingPrice);
                let salePrice = cleanPrice(rawSalePrice);

                // Company -> companies (Array)
                let companies = [];
                if (row.Company || row.COMPANY || row.company) {
                    companies.push(String(row.Company || row.COMPANY || row.company).trim());
                }

                // Salt -> salt (Array, split by '|')
                let saltArray = [];
                const rawSalt = row.salt || row.Salt || row.SALT;
                if (rawSalt) {
                    // "Amoxycillin 250mg | Clavulanic acid 125mg"
                    saltArray = String(rawSalt).split('|').map(s => s.trim());
                }

                // Description parts
                let descriptionParts = [];
                if (row.Composition) descriptionParts.push(`Composition: ${row.Composition}`);
                // if (row.Dosage) descriptionParts.push(`Dosage: ${row.Dosage}`); // Removed
                // if (row.Packing) descriptionParts.push(`Packing: ${row.Packing}`); // Removed
                if (row.Description) descriptionParts.push(row.Description);
                const finalDescription = descriptionParts.join(' | ');

                // Dosage & Packing
                const dosage = row.Dosage || row.dosage || null;
                const packing = row.Packing || row.packing || null;

                const stock = row.Stock || row.stock || 0;

                // Category Logic:
                // 1. Row 'Category' (Column J)
                // 2. Section Header (inferred from previous loop)
                // 3. Title inferred
                let targetCategoryId = null;

                // Check row category column
                const rowCategoryName = row.Category || row.category || row.CATEGORY;
                if (rowCategoryName && typeof rowCategoryName === 'string') {
                    // Try to find category by name
                    const cleanName = rowCategoryName.trim();
                    let cat = await Category.findOne({ where: { name: cleanName } });
                    if (!cat) {
                        // Create it!
                        cat = await Category.create({
                            name: cleanName,
                            slug: cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                            parentId: currentSectionCategoryId || inferredCategoryId
                        }); // If inside a section, make it a child? Or top level? 
                        // The screenshot shows "Tablet" as category. "Antibiotics" as section. 
                        // Likely "Tablet" is a child of "Antibiotics".
                    }
                    targetCategoryId = cat.id;
                }

                if (!targetCategoryId) {
                    targetCategoryId = currentSectionCategoryId || inferredCategoryId;
                }

                // SKIP SECTION HEADERS / INVALID ROWS
                // Logic: A row is a header if Name is present but Price/Packing are effectively empty/invalid
                const isEmpty = (val) => {
                    if (!val && val !== 0) return true;
                    if (typeof val === 'string') {
                        const t = val.trim();
                        return t === '' || t === '-' || t === '.' || t === '0';
                    }
                    return false;
                };

                // Is this a section header like "INJECTABLES"?
                // If it has a Name but no Price, no Packing, no Salt... it's likely a header.
                // BUT, wait, "Tablet" column might be filled? 
                if (name && isEmpty(price) && isEmpty(row.Packing) && isEmpty(rawSalt)) {
                    // Treat as Section Header
                    const sectionName = name.trim();
                    let sectionCategory = await Category.findOne({ where: { name: sectionName } });
                    if (!sectionCategory) {
                        sectionCategory = await Category.create({
                            name: sectionName,
                            slug: sectionName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                            parentId: inferredCategoryId
                        });
                    }
                    currentSectionCategoryId = sectionCategory.id;
                    continue; // Skip creating product
                }

                if (!name) continue; // Skip empty rows
                if (!price) {
                    errors.push(`Row ${rowNumber}: Price is missing for "${name}"`);
                    failedCount++;
                    continue;
                }
                if (!targetCategoryId) {
                    errors.push(`Row ${rowNumber}: Category could not be determined for "${name}"`);
                    failedCount++;
                    continue;
                }

                // Duplicate Check
                const existingProduct = await Product.findOne({ where: { name: name } });
                if (existingProduct) {
                    errors.push(`Row ${rowNumber}: Duplicate product name "${name}"`);
                    failedCount++;
                    continue;
                }

                const product = await Product.create({
                    name,
                    sku, // Add SKU
                    description: finalDescription,
                    price: price || 0, // Fallback
                    buyingPrice: buyingPrice || null,
                    salePrice: salePrice || null,
                    companies: companies, // Array
                    stock,
                    salt: saltArray, // Array
                    // CategoryId: targetCategoryId, // Deprecated
                    imageUrls: ["https://res.cloudinary.com/dhvch5umt/image/upload/v1768724782/medical-equipments-500x500_ul7oua.webp"],
                    publicIds: [],
                    dosage,
                    packing
                });

                if (targetCategoryId) {
                    await product.setCategories([targetCategoryId]);
                }

                successCount++;
            } catch (err) {
                console.error(`Row ${rowNumber} Error:`, err);
                errors.push(`Row ${rowNumber}: ${err.message}`);
                failedCount++;
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
