const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const Product = require('../models/product');
const Category = require('../models/category');
const Retailer = require('../models/retailer');
const Company = require('../models/company');
const { cloudinary } = require('../config/cloudinaryConfig');
const { getDescendantCategoryIds } = require('../utils/categoryHelpers');
const xlsx = require('xlsx');

// Helper to clean response
const getCleanProduct = (productInstance) => {
    if (!productInstance) return null;
    const plain = productInstance.get ? productInstance.get({ plain: true }) : productInstance;
    if (plain.CategoryId !== undefined) delete plain.CategoryId;
    if (plain.publicIds !== undefined) delete plain.publicIds;

    // Format Expiry to DD-MM-YYYY
    if (plain.expiry) {
        const d = new Date(plain.expiry);
        if (!isNaN(d.getTime())) {
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            plain.expiry = `${day}-${month}-${year}`;
        }
    }

    return plain;
};

// Create Product
const createProduct = async (req, res) => {
    try {
        const { name, description, price, buyingPrice, salePrice, companies, stock, categoryId, categoryIds, salt, sku, dosage, packing, expiry } = req.body;

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

        const parseArrayField = (field) => {
            if (!field) return [];
            if (Array.isArray(field)) return field; // Already an array
            try {
                return JSON.parse(field);
            } catch (e) {
                return [field];
            }
        };

        // Helper to validate and convert Expiry to YYYY-MM-DD
        const parseAndValidateExpiry = (dateInput) => {
            if (!dateInput) return null;
            const dateStr = String(dateInput).trim();
            // Strict DD-MM-YYYY
            const dmyMatch = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
            if (!dmyMatch) {
                if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    // YYYY-MM-DD is technically valid for DB, but user asked to reject if NOT DD-MM-YYYY?
                    // "it should accept dd-mm-yyyy" implies strictness. 
                    // Let's throw error for YYYY-MM-DD to be consistent with request "otherwise it should give err"
                    throw new Error(`Invalid expiry format "${dateStr}". Please use DD-MM-YYYY.`);
                }
                throw new Error(`Invalid expiry format "${dateStr}". Please use DD-MM-YYYY.`);
            }
            // Return YYYY-MM-DD for DB
            return `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`;
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

            imageUrls: imageUrls, // Store array
            publicIds: publicIds, // Store array
            dosage, // Add Dosage
            packing, // Add Packing
            expiry: parseAndValidateExpiry(expiry) // Add Expiry with Validation
        });

        // Link Company logic:
        // Use provided companies array (first item) to link with Company model
        const companyTags = parseArrayField(companies);
        if (companyTags && companyTags.length > 0) {
            const companyName = companyTags[0];
            const [company] = await Company.findOrCreate({
                where: { name: companyName },
                defaults: { status: 'active' }
            });
            await product.setCompany(company);
        }

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
            include: [
                {
                    model: Category,
                    as: 'Categories',
                    through: { attributes: [] }
                },
                {
                    model: Company,
                    attributes: ['id', 'name', 'status']
                }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            subQuery: false, // IMPORTANT: Required when filtering by associated model (Category name) with limit/offset
            distinct: true // ensure distinct count of products, not joined rows
        };

        if (search) {
            queryOptions.where = {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    // Fix: Cast JSON columns to CHAR for LIKE search
                    sequelize.where(sequelize.fn('LOWER', sequelize.cast(sequelize.col('salt'), 'CHAR')), { [Op.like]: `%${search.toLowerCase()}%` }),
                    sequelize.where(sequelize.fn('LOWER', sequelize.cast(sequelize.col('companies'), 'CHAR')), { [Op.like]: `%${search.toLowerCase()}%` }),
                    { '$Categories.name$': { [Op.like]: `%${search}%` } }
                ]
            };
        }

        // 1. FILTER INACTIVE COMPANIES
        // 1. FILTER INACTIVE COMPANIES
        // If user is NOT Admin, they should only see products from ACTIVE companies.
        if (!req.user || req.user.role !== 'admin') {
            // Using top-level where with association syntax ensures findAndCountAll respects it for the count query
            // and forces an INNER JOIN
            queryOptions.where = {
                ...queryOptions.where,
                '$Company.status$': 'active'
            };

            // We don't strictly need to set required: true on the include if we usage top level where,
            // but keeping the include clean is good.
        }

        // 2. RETAILER PERMISSIONS (Category-based)
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
                    // Filter via Association (Inner Join)
                    // We modify the include to apply the where clause on the joined table
                    if (queryOptions.include && queryOptions.include[0]) {
                        queryOptions.include[0].where = { id: { [Op.in]: expandedCategoryIds } };
                        queryOptions.include[0].required = true; // Inner join to enforce filter
                    }
                }
                // Else: Do nothing, let them see all products (subject to company filter above)
            }
        }

        const { count, rows } = await Product.findAndCountAll(queryOptions);

        let mergedRows = [];
        if (rows.length > 0) {
            // Fetch raw data for dynamic columns
            const ids = rows.map(r => r.id);
            const rawData = await sequelize.query(
                `SELECT * FROM Products WHERE id IN (:ids)`,
                {
                    replacements: { ids },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            // Merge raw data into sequelize instances
            mergedRows = rows.map(p => {
                const plain = p.get({ plain: true });
                const raw = rawData.find(r => r.id === p.id) || {};

                // Merge, prioritizing Sequelize (for associations) but taking dynamic fields from raw
                // Note: Raw fields will lowercase keys usually in MySQL, depends on driver. 
                // We trust Sequelize fields first.
                return { ...raw, ...plain };
            });
        }

        // Sanitize response: Remove 'CategoryId' (uppercase) if 'categoryId' (lowercase) exists or just cleanup
        const cleanRows = mergedRows.map(p => {
            const plain = p;
            if (plain.CategoryId !== undefined) delete plain.CategoryId;
            if (plain.publicIds !== undefined) delete plain.publicIds; // Remove publicIds

            // Remove accidental dynamic columns
            delete plain.imageurl;
            delete plain['s.no'];
            delete plain.sno;
            delete plain['no.'];
            delete plain.s_no;

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
            include: [
                {
                    model: Category,
                    through: { attributes: [] } // Exclude junction table data
                },
                {
                    model: Company,
                    attributes: ['id', 'name', 'status']
                }
            ]
        });
        if (product) {
            // Fetch raw data for dynamic columns
            const [rawProduct] = await sequelize.query(
                `SELECT * FROM Products WHERE id = :id`,
                {
                    replacements: { id: req.params.id },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            const plain = product.get({ plain: true });
            const merged = { ...(rawProduct || {}), ...plain };

            // Helper to clean helper keys from final response
            const response = getCleanProduct(merged);
            if (response.imageurl) delete response.imageurl;
            if (response['s.no']) delete response['s.no'];
            if (response.sno) delete response.sno;
            if (response['no.']) delete response['no.'];
            if (response.s_no) delete response.s_no;

            res.status(200).json(response);
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
        const { name, description, price, buyingPrice, salePrice, companies, stock, salt, sku, dosage, packing, categoryIds, expiry } = req.body;
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

        // Helper to validate and convert Expiry to YYYY-MM-DD
        const parseAndValidateExpiry = (dateInput) => {
            if (!dateInput) return undefined; // Should be null or undefined?
            if (dateInput === null) return null;

            const dateStr = String(dateInput).trim();
            const dmyMatch = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
            if (!dmyMatch) {
                if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    throw new Error(`Invalid expiry format "${dateStr}". Please use DD-MM-YYYY.`);
                }
                throw new Error(`Invalid expiry format "${dateStr}". Please use DD-MM-YYYY.`);
            }
            return `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`;
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
            packing, // Add Packing
            expiry: parseAndValidateExpiry(expiry) // Add Expiry
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

        // Link Company logic (Update):
        const companyTags = parseArrayField(companies);
        if (companyTags && companyTags.length > 0) {
            const companyName = companyTags[0];
            const [company] = await Company.findOrCreate({
                where: { name: companyName },
                defaults: { status: 'active' }
            });
            await product.setCompany(company);
        }

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

        // --- DYNAMIC COLUMN LOGIC START ---
        // 1. Identify all headers from the first valid row (or merged from a few rows if needed, but usually first is enough)
        if (rows.length > 0) {
            const potentialHeaders = Object.keys(rows[0]);

            // 2. Fetch Existing DB Columns
            const [dbColumns] = await sequelize.query("DESCRIBE Products");
            const existingColumnNames = new Set(dbColumns.map(c => c.Field.toLowerCase()));

            // 3. Define Known/Standard Columns (to ignore)
            // precise keys we already handle manually
            const standardKeys = new Set([
                'name', 'product name',
                'sku', 'id',
                'description',
                'price', 'mrp',
                'buying price', 'buyingprice',
                'sale price', 'saleprice', 'selling price', 'price_1',
                'company', 'companies',
                'stock',
                'salt',
                'dosage',
                'packing',
                'category', 'composition',
                'imageurls', 'imageurl', 'publicids', 'createdat', 'updatedat',
                's.no', 'sno', 'no.',
                'expiry', 'expiry date', 'exp', 'expirydate'
            ]);

            // 4. Identify New Columns
            const dynamicMappings = []; // { header: "Flavor", dbColumn: "flavor" }

            for (const header of potentialHeaders) {
                const lowerHeader = header.toLowerCase().trim();
                // Check if it's a standard key (fuzzy match usually handled in code, but here we just check our set)
                // We strictly map specific headers in the loop. Anything else is "Dynamic".
                if (standardKeys.has(lowerHeader)) continue;

                // Sanitize for DB Column Name
                // "Expiry Date" -> "expiry_date"
                let dbColumn = lowerHeader.replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');

                if (!dbColumn) continue; // Skip empty/special char only headers

                // Store mapping
                dynamicMappings.push({ header, dbColumn });

                // 5. Alter Table if Column doesn't exist
                if (!existingColumnNames.has(dbColumn)) {
                    console.log(`Dynamic Schema: Adding column '${dbColumn}' for header '${header}'...`);
                    try {
                        // Use raw query to add column. Default VARCHAR(255) is safe for generic text.
                        // Escape column name to prevent SQL injection issues (though regex above cleans it)
                        await sequelize.query(`ALTER TABLE Products ADD COLUMN \`${dbColumn}\` VARCHAR(255) DEFAULT NULL;`);
                        existingColumnNames.add(dbColumn); // Update local set
                    } catch (alterErr) {
                        // Ignore if duplicate error, otherwise log
                        if (alterErr.original && alterErr.original.code !== 'ER_DUP_FIELDNAME') {
                            console.error(`Failed to add column '${dbColumn}':`, alterErr.message);
                        }
                    }
                }
            }

            // Attach mappings to request or local scope for use in loop using a wrapper logic
            // (We will use 'dynamicMappings' inside the loop)
            req.dynamicMappings = dynamicMappings;
        }
        // --- DYNAMIC COLUMN LOGIC END ---

        let successCount = 0;
        let failedCount = 0;
        let errors = [];
        let currentSectionCategoryId = null; // Declare here

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNumber = i + headerRowIndex + 2;

            // Normalize Row Keys: Create a lowercase map for easier access
            // e.g. 'Description' -> 'description', 'Image URL' -> 'imageurl'
            const normalizedRow = {};
            Object.keys(row).forEach(key => {
                normalizedRow[key.toLowerCase().trim().replace(/[^a-z0-9]+/g, '')] = row[key];
                // Also keep original key for dynamic mapping if needed? 
                // Actually, dynamic logic uses 'dbColumn' which is normalized.
                // We'll keep 'row' for original precise access if needed, but rely on normalizedRow for standard fields.
            });

            try {
                // Normalize keys & Handle User-Specific Columns
                // Use normalizedRow to be robust against "Name", "NAME", "Product Name"
                const name = normalizedRow.name || normalizedRow.productname;

                // SKU Logic
                let sku = normalizedRow.sku;
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

                let rawPrice = normalizedRow.price || normalizedRow.mrp;
                let rawBuyingPrice = normalizedRow.buyingprice;
                let rawSalePrice = normalizedRow.saleprice || normalizedRow.price_1 || normalizedRow.sellingprice;

                let price = cleanPrice(rawPrice);
                let buyingPrice = cleanPrice(rawBuyingPrice);
                let salePrice = cleanPrice(rawSalePrice);

                let companies = [];
                if (normalizedRow.company) {
                    companies.push(String(normalizedRow.company).trim());
                }

                // Salt -> salt (Map Composition to Salt)
                let saltArray = [];
                const rawSalt = normalizedRow.salt || normalizedRow.composition;
                if (rawSalt) {
                    // "Amoxycillin 250mg | Clavulanic acid 125mg"
                    saltArray = String(rawSalt).split('|').map(s => s.trim());
                }

                // Description parts
                let descriptionParts = [];
                // if (normalizedRow.composition) descriptionParts.push(`Composition: ${normalizedRow.composition}`); // Moved to Salt
                // if (normalizedRow.dosage) descriptionParts.push(`Dosage: ${normalizedRow.dosage}`); // Removed
                // if (normalizedRow.packing) descriptionParts.push(`Packing: ${normalizedRow.packing}`); // Removed
                const desc = normalizedRow.description;
                if (desc) descriptionParts.push(desc);
                const finalDescription = descriptionParts.join(' | ');

                // Dosage & Packing
                const dosage = normalizedRow.dosage || null;
                const packing = normalizedRow.packing || null;

                const stock = normalizedRow.stock || 0;

                // Category Logic:
                // 1. Row 'Category'
                let targetCategoryId = null;

                // Check row category column
                const rowCategoryName = normalizedRow.category;
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


                if (name && isEmpty(price) && isEmpty(packing) && isEmpty(rawSalt)) {
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

                // Expiry Logic
                let expiryDate = null;
                const rawExpiry = normalizedRow.expiry || normalizedRow.expirydate || normalizedRow.exp;
                if (rawExpiry) {
                    // Check if Excel serial date (number)
                    if (typeof rawExpiry === 'number') {
                        // Excel date to JS Date: (value - 25569) * 86400 * 1000
                        expiryDate = new Date((rawExpiry - 25569) * 86400 * 1000);
                    } else {
                        // Strict validation for String Dates: Must be DD-MM-YYYY
                        const dateStr = String(rawExpiry).trim();
                        // Regex for DD-MM-YYYY or DD/MM/YYYY
                        const dmyMatch = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);

                        if (dmyMatch) {
                            // Valid format: DD-MM-YYYY
                            expiryDate = new Date(`${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`);
                        } else {
                            // Invalid format
                            errors.push(`Row ${rowNumber}: Invalid expiry format "${rawExpiry}". Use DD-MM-YYYY.`);
                            failedCount++;
                            continue; // Skip this row
                        }
                    }
                    if (isNaN(expiryDate.getTime())) {
                        errors.push(`Row ${rowNumber}: Invalid date value "${rawExpiry}".`);
                        failedCount++;
                        continue;
                    }
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
                    imageUrls: (normalizedRow.imageurl)
                        ? [normalizedRow.imageurl]
                        : ["https://res.cloudinary.com/dhvch5umt/image/upload/v1768724782/medical-equipments-500x500_ul7oua.webp"],
                    publicIds: [],
                    dosage,
                    packing,
                    expiry: expiryDate
                });

                if (targetCategoryId) {
                    await product.setCategories([targetCategoryId]);
                }

                // Link Company logic (Bulk Upload):
                if (companies && companies.length > 0) {
                    const companyName = companies[0];
                    if (companyName) {
                        try {
                            const [company] = await Company.findOrCreate({
                                where: { name: companyName },
                                defaults: { status: 'active' }
                            });
                            await product.setCompany(company);
                        } catch (err) {
                            console.error(`Row ${rowNumber}: Failed to link company:`, err.message);
                        }
                    }
                }

                // --- DYNAMIC DATA INSERTION START ---
                if (req.dynamicMappings && req.dynamicMappings.length > 0) {
                    const updates = {};
                    const replacements = [];

                    for (const mapping of req.dynamicMappings) {
                        const val = row[mapping.header];
                        if (val !== undefined && val !== null && val !== '') {
                            updates[mapping.dbColumn] = val;
                        }
                    }

                    if (Object.keys(updates).length > 0) {
                        // Build Update Query: "UPDATE Products SET col1 = ?, col2 = ? WHERE id = ?"
                        const setClauses = Object.keys(updates).map(col => `\`${col}\` = ?`).join(', ');
                        const values = Object.values(updates);
                        values.push(product.id);

                        try {
                            await sequelize.query(
                                `UPDATE Products SET ${setClauses} WHERE id = ?`,
                                { replacements: values }
                            );
                        } catch (dynErr) {
                            console.error(`Row ${rowNumber}: Failed to save dynamic fields:`, dynErr.message);
                            // Don't fail the whole row, just log
                        }
                    }
                }
                // --- DYNAMIC DATA INSERTION END ---

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
        await Product.destroy({ where: {} });
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
