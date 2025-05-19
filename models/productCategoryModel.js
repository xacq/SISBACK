const { DataTypes } = require('sequelize');
const sequelize = require('../config/db').default; // Asegúrate que la ruta a tu config de Sequelize sea correcta

const ProductCategory = sequelize.define('ProductCategory', {
    category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.ENUM('energia', 'hidratacion', 'recuperacion', 'vitaminas'),
        allowNull: true // o false si es obligatorio
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    usage_context: {
        type: DataTypes.ENUM('pre entrenamiento', 'durante entrenamiento', 'post entrenamiento', 'diario'),
        allowNull: true
    }
}, {
    tableName: 'product_categories',
    timestamps: false // Tu tabla no tiene createdAt/updatedAt
});

// Métodos de asociación
export const hasOne = (model, options) => {
  User.hasOne(model, options);
};

export const hasMany = (model, options) => {
  User.hasMany(model, options);
};

module.exports = ProductCategory;