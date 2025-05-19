const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProductAttribute = sequelize.define('ProductAttribute', {
    attribute_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.ENUM(
            'vegetariano', 'vegano', 'libre de gluten', 'libre de lactosa',
            'libre de trigo', 'libre de frutos secos', 'libre de soya',
            'con cafeina', 'isotonico', 'alto en carbohidrato', 'alto en proteina'
        ),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'product_attributes',
    timestamps: false
});

module.exports = ProductAttribute;