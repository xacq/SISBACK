const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserProfile = sequelize.define('UserProfile', {
    profile_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    user_id: { // FK explícita
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        },
        onDelete: 'CASCADE' // Si se borra un usuario, se borra su perfil
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    weight: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    height: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    gender: {
        type: DataTypes.ENUM('hombre', 'mujer', 'otro', 'prefiero no decir'),
        allowNull: true
    },
    activity_level: {
        type: DataTypes.ENUM('sedentario', 'ligero', 'moderado', 'activo', 'muy activo'), // Ajustado
        allowNull: true
    },
    training_frequency: {
        type: DataTypes.ENUM('1-2', '3-4', '5+', 'ocacional'),
        allowNull: true
    },
    primary_goal: {
        type: DataTypes.ENUM('mejor rendimiento', 'perder peso', 'ganar musculo', 'resistencia', 'recuperacion', 'por salud'),
        allowNull: true
    },
    sweat_level: {
        type: DataTypes.ENUM('bajo', 'medio', 'alto'),
        allowNull: true
    },
    caffeine_tolerance: {
        type: DataTypes.ENUM('no', 'bajo', 'medio', 'alto'),
        allowNull: true
    },
    dietary_restrictions: {
        type: DataTypes.ENUM('vegetariano', 'vegano', 'libre de gluten', 'libre de lactosa', 'libre de frutos secos', 'no'),
        defaultValue: 'no',
        allowNull: true // Aunque tenga default, puede ser explícitamente nulo si así se desea
    }
}, {
    tableName: 'user_profiles',
    timestamps: false
});

module.exports = UserProfile;