const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Recommendation = sequelize.define('Recommendation', {
    recommendation_id: {
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
    session_id: { // FK
        type: DataTypes.INTEGER,
        allowNull: true, // Puede no estar asociada a una sesión específica
        references: {
            model: 'training_sessions',
            key: 'session_id'
        }
    },
    product_id: { // FK
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'product_id'
        }
    },
    recommended_at: {
        type: DataTypes.DATE, // TIMESTAMP se maneja como DATE en Sequelize
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    feedback: {
        type: DataTypes.ENUM('positivo', 'neutral', 'negativo'),
        allowNull: true
    },
    feedback_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'recommendations',
    timestamps: false // 'recommended_at' se maneja con defaultValue
});

module.exports = Recommendation;