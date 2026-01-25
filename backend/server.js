require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const retailerRoutes = require('./routes/retailerRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const couponRoutes = require('./routes/couponRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Initialize Associations (Must be before routes use models if possible, or definitely before server starts)
require('./models/associations');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/retailers', retailerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
const paymentConfigRoutes = require('./routes/paymentConfigRoutes');
app.use('/api/payment-config', paymentConfigRoutes);
const appSettingRoutes = require('./routes/appSettingRoutes');
app.use('/api/app-settings', appSettingRoutes);

// Database Connection & Server Start
const startServer = async () => {


    await connectDB();

    // Sync models with database
    // Use force: true only for development to recreate tables.
    await sequelize.sync({ force: false });
    console.log('Database synced');

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

};

startServer();
