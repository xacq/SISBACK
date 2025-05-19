const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

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

module.exports = Flavor;