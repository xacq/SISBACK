const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js').default; // Importa la instancia de Sequelize

const Product = sequelize.define('Product', {
    product_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    type_id: { // FK explícita para la asociación
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'product_types',
            key: 'type_id'
        }
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    image_url: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    usage_recommendation: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN, // O DataTypes.TINYINT(1)
        defaultValue: true,
        allowNull: true
    }
}, {
    tableName: 'products',
    timestamps: false // Tu tabla no tiene createdAt/updatedAt
});


// Métodos de asociación
export const hasOne = (model, options) => {
  User.hasOne(model, options);
};

export const hasMany = (model, options) => {
  User.hasMany(model, options);
};
module.exports = Product;