const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js').default;

const ProductType = sequelize.define('ProductType', {
    type_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    category_id: { // Mantendremos la FK explícita para la asociación
        type: DataTypes.INTEGER,
        allowNull: true, // O false si siempre debe tener una categoría
        references: {
            model: 'product_categories', // Nombre de la tabla referenciada
            key: 'category_id'
        }
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'product_types',
    timestamps: false
});

// Métodos de asociación
export const hasOne = (model, options) => {
  User.hasOne(model, options);
};

export const hasMany = (model, options) => {
  User.hasMany(model, options);
};

module.exports = ProductType;