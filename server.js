require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const sequelize = require('./config/db');

// --- 1. IMPORTAR TODOS LOS MODELOS ---
const User = require('./models/userModel');
const Product = require('./models/productModel');
const ProductCategory = require('./models/productCategoryModel');
const ProductType = require('./models/productTypeModel');
const Flavor = require('./models/flavorModel');
const ProductAttribute = require('./models/productAttributeModel');
const ProductNutrition = require('./models/productNutritionModel');
const UserProfile = require('./models/userProfileModel');
const Recommendation = require('./models/recommendationModel');
const TrainingSession = require('./models/trainingSessionModel');

// --- 2. DEFINIR ASOCIACIONES ---

// User <-> UserProfile (One-to-One)
User.hasOne(UserProfile, {
    foreignKey: 'user_id', // En UserProfile
    onDelete: 'CASCADE'    // Si se borra un User, se borra su UserProfile
});
UserProfile.belongsTo(User, {
    foreignKey: 'user_id'  // En UserProfile
});

// ProductCategory <-> ProductType (One-to-Many)
ProductCategory.hasMany(ProductType, {
    foreignKey: 'category_id' // En ProductType
});
ProductType.belongsTo(ProductCategory, {
    foreignKey: 'category_id' // En ProductType
});

// ProductType <-> Product (One-to-Many)
ProductType.hasMany(Product, {
    foreignKey: 'type_id' // En Product
});
Product.belongsTo(ProductType, {
    foreignKey: 'type_id' // En Product
});

// Product <-> ProductNutrition (One-to-One)
Product.hasOne(ProductNutrition, {
    foreignKey: 'product_id' // En ProductNutrition
});
ProductNutrition.belongsTo(Product, {
    foreignKey: 'product_id' // En ProductNutrition
});

// Product <-> Flavor (Many-to-Many)
// La tabla intermedia es 'product_flavors'
Product.belongsToMany(Flavor, {
    through: 'product_flavors', // Nombre exacto de la tabla intermedia
    foreignKey: 'product_id',    // Clave en product_flavors que referencia a products
    otherKey: 'flavor_id',       // Clave en product_flavors que referencia a flavors
    timestamps: false            // La tabla product_flavors no tiene timestamps
});
Flavor.belongsToMany(Product, {
    through: 'product_flavors',
    foreignKey: 'flavor_id',
    otherKey: 'product_id',
    timestamps: false
});

// Product <-> ProductAttribute (Many-to-Many)
// La tabla intermedia es 'product_attributes_mapping'
Product.belongsToMany(ProductAttribute, {
    through: 'product_attributes_mapping',
    foreignKey: 'product_id',
    otherKey: 'attribute_id',
    timestamps: false
});
ProductAttribute.belongsToMany(Product, {
    through: 'product_attributes_mapping',
    foreignKey: 'attribute_id',
    otherKey: 'product_id',
    timestamps: false
});

// User <-> TrainingSession (One-to-Many)
User.hasMany(TrainingSession, {
    foreignKey: 'user_id' // En TrainingSession
});
TrainingSession.belongsTo(User, {
    foreignKey: 'user_id' // En TrainingSession
});

// User <-> Recommendation (One-to-Many)
User.hasMany(Recommendation, {
    foreignKey: 'user_id' // En Recommendation
});
Recommendation.belongsTo(User, {
    foreignKey: 'user_id' // En Recommendation
});

// Product <-> Recommendation (One-to-Many)
Product.hasMany(Recommendation, {
    foreignKey: 'product_id' // En Recommendation
});
Recommendation.belongsTo(Product, {
    foreignKey: 'product_id' // En Recommendation
});

// TrainingSession <-> Recommendation (One-to-Many, pero session_id puede ser NULL)
TrainingSession.hasMany(Recommendation, {
    foreignKey: 'session_id', // En Recommendation
    constraints: false // No fuerces la restricción si session_id puede ser null
});
Recommendation.belongsTo(TrainingSession, {
    foreignKey: 'session_id',
    allowNull: true,    // Es importante para que Sequelize sepa que puede ser null
    constraints: false
});

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// --- 3. SINCRONIZAR LA BASE DE DATOS (CON CUIDADO) ---
// ... tus middlewares (app.use(express.json()), app.use(cors()), etc.)
app.use('/api/auth', authRoutes);
app.use('/api/users', profileRoutes);
app.use('/api/products', productRoutes);

// ... tus rutas (app.use('/api/auth', authRoutes), etc.)
// Rutas
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const productRoutes = require('./routes/productRoutes'); // Nueva línea

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');
        // Sincronizar modelos con la base de datos
        // ¡PRECAUCIÓN con force: true en producción o con datos existentes!
        return sequelize.sync({
            // force: true, // Borra y recrea tablas. ¡PELIGROSO CON DATOS!
            // alter: true, // Intenta modificar tablas. Más seguro, pero revisa.
        }); // Sin opciones, solo crea tablas si no existen.
    })
    .then(() => {
        console.log('All models were synchronized successfully.');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database or sync models:', err);
    });