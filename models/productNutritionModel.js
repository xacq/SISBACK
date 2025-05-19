const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProductNutrition = sequelize.define('ProductNutrition', {
    nutrition_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    product_id: { // FK explícita para la asociación
        type: DataTypes.INTEGER,
        allowNull: true, // O false si siempre debe tener un producto
        references: {
            model: 'products',
            key: 'product_id'
        }
    },
    serving_size: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    energy_kcal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    protein_g: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    carbs_g: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    sugars_g: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    sodium_mg: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    potassium_mg: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    magnesium_mg: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    caffeine_mg: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    other_components: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: 'None'
    }
}, {
    tableName: 'product_nutrition',
    timestamps: false
});

module.exports = ProductNutrition;