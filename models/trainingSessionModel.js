const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TrainingSession = sequelize.define('TrainingSession', {
    session_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    user_id: { // FK
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    session_date: {
        type: DataTypes.DATEONLY, // Solo fecha
        allowNull: false
    },
    duration_min: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    intensity: {
        type: DataTypes.ENUM('bajo', 'medio', 'alto', 'muy alto'),
        allowNull: true
    },
    type: { // 'type' es una palabra reservada en JS, Sequelize la maneja bien pero ten cuidado
        type: DataTypes.ENUM('cardio', 'fuerza', 'hiit', 'resistencia', 'mixed', 'otro'),
        allowNull: true,
        field: 'type' // Asegura el mapeo correcto si hay conflicto
    },
    weather: {
        type: DataTypes.ENUM('frio', 'fresco', 'moderado', 'calido', 'caliente', 'humedo'),
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'training_sessions',
    timestamps: false
});

module.exports = TrainingSession;