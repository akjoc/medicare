require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const retailerRoutes = require('./routes/retailerRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

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
