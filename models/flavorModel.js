const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js').default;

const Flavor = sequelize.define('Flavor', {
    flavor_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
}, {
    tableName: 'flavors',
    timestamps: false
});

// Métodos de asociación
export const hasOne = (model, options) => {
  User.hasOne(model, options);
};

export const hasMany = (model, options) => {
  User.hasMany(model, options);
};

export default Flavor;