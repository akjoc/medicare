const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Categories', // Self-reference
            key: 'id',
        },
    }
}, {
    timestamps: true
});

// Self-referencing association
Category.hasMany(Category, { as: 'subCategories', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

// Associations will be defined in a central place or here if circular dependency allows.
// Ideally, Product should be required here to define association, or define it in a separate associations.js
// For now, I'll add a comment that associations are handled in server.js or product.js to avoid circular require issues immediately, 
// OR simpler: use string references if Sequelize supports it cleanly (it does with sequelize.models).

module.exports = Category;
