const Product = require('./product');
const Category = require('./category');
const ProductCategory = require('./productCategory');
const Retailer = require('./retailer');
const User = require('./user');
const Company = require('./company');

// Product - Category Association (Many-to-Many)
Product.belongsToMany(Category, { through: ProductCategory });
Category.belongsToMany(Product, { through: ProductCategory });

// Company - Product Association
Company.hasMany(Product, { foreignKey: 'companyId' });
Product.belongsTo(Company, { foreignKey: 'companyId' });

// Existing Associations (Documenting here for clarity, though might be in models already)
// Retailer - User
Retailer.belongsTo(User);
User.hasOne(Retailer);

// Retailer Permissions (RetailerCategory) - Assuming RetailerCategory model exists or defined inline elsewhere
// For now, focusing on the new Product-Category link.

// Coupon Associations (if any needed in future, e.g., CouponRedemption log)
const Coupon = require('./coupon');
const Cart = require('./cart');
const CartItem = require('./cartItem');
// User already imported above

// Product - Category (Many-to-Many)
Product.belongsToMany(Category, { through: ProductCategory });
Category.belongsToMany(Product, { through: ProductCategory });

// User - Cart (One-to-One)
User.hasOne(Cart, { foreignKey: 'userId', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'userId' });

// Cart - CartItems (One-to-Many)
Cart.hasMany(CartItem, { foreignKey: 'cartId', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });

// CartItem - Product
Product.hasMany(CartItem, { foreignKey: 'productId', onDelete: 'CASCADE' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });

const Order = require('./order');
const OrderItem = require('./orderItem');
const PaymentConfig = require('./PaymentConfig');

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

// Order.belongsTo(Address); // Removed as per request

Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

const AppSetting = require('./AppSetting');

module.exports = { Product, Category, ProductCategory, Coupon, Cart, CartItem, User, Order, OrderItem, Retailer, PaymentConfig, Company, AppSetting };
