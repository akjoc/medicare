const Product = require('./product');
const Category = require('./category');
const ProductCategory = require('./productCategory');
const Retailer = require('./retailer');
const User = require('./user');

// Product - Category Association (Many-to-Many)
Product.belongsToMany(Category, { through: ProductCategory });
Category.belongsToMany(Product, { through: ProductCategory });

// Existing Associations (Documenting here for clarity, though might be in models already)
// Retailer - User
Retailer.belongsTo(User);
User.hasOne(Retailer);

// Retailer Permissions (RetailerCategory) - Assuming RetailerCategory model exists or defined inline elsewhere
// For now, focusing on the new Product-Category link.

// Coupon Associations (if any needed in future, e.g., CouponRedemption log)
const Coupon = require('./coupon');

module.exports = { Product, Category, ProductCategory, Coupon };
