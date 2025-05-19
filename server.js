import 'dotenv/config'; // Versión ES Modules de dotenv
import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';

import pool from './config/db.js';

const app = express();
app.use(express.json());  // Reemplaza body-parser.json()
app.use(express.urlencoded({ extended: true }));  // Reemplaza body-parser.urlencoded()
app.use(cors());

// --- 2. IMPORTAR MODELOS CON SINTAXIS CORRECTA ---
// Cambiamos a importar el módulo completo y luego destructurar
import * as UserModule from './models/userModel.js';
import * as ProductModule from './models/productModel.js';
import * as ProductCategoryModule from './models/productCategoryModel.js';
import * as ProductTypeModule from './models/productTypeModel.js';
import * as FlavorModule from './models/flavorModel.js';
import * as ProductAttributeModule from './models/productAttributeModel.js';
import * as ProductNutritionModule from './models/productNutritionModel.js';
import * as UserProfileModule from './models/userProfileModel.js';
import * as RecommendationModule from './models/recommendationModel.js';
import * as TrainingSessionModule from './models/trainingSessionModel.js';

// Destructurar los modelos y métodos de asociación
const User = UserModule.default;
const { hasOne, hasMany } = UserModule;

const Product = ProductModule.default;
const { belongsTo: productBelongsTo, 
       hasOne: productHasOne, 
       belongsToMany: productBelongsToMany, 
       hasMany: productHasMany } = ProductModule;

const ProductCategory = ProductCategoryModule.default;
const { hasMany: categoryHasMany } = ProductCategoryModule;

const ProductType = ProductTypeModule.default;
const { belongsTo: typeBelongsTo, hasMany: typeHasMany } = ProductTypeModule;

const Flavor = FlavorModule.default;
const { belongsToMany: flavorBelongsToMany } = FlavorModule;

const ProductAttribute = ProductAttributeModule.default;
const { belongsToMany: attributeBelongsToMany } = ProductAttributeModule;

const ProductNutrition = ProductNutritionModule.default;
const { belongsTo: nutritionBelongsTo } = ProductNutritionModule;

const UserProfile = UserProfileModule.default;
const { belongsTo: profileBelongsTo } = UserProfileModule;

const Recommendation = RecommendationModule.default;
const { belongsTo: recommendationBelongsTo } = RecommendationModule;

const TrainingSession = TrainingSessionModule.default;
const { belongsTo: sessionBelongsTo, hasMany: sessionHasMany } = TrainingSessionModule;

// --- 3. DEFINIR ASOCIACIONES ---
// User <-> UserProfile (One-to-One)
hasOne(UserProfile, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
});
profileBelongsTo(User, {
    foreignKey: 'user_id'
});

// ProductCategory <-> ProductType (One-to-Many)
categoryHasMany(ProductType, {
    foreignKey: 'category_id'
});
typeBelongsTo(ProductCategory, {
    foreignKey: 'category_id'
});

// ProductType <-> Product (One-to-Many)
typeHasMany(Product, {
    foreignKey: 'type_id'
});
productBelongsTo(ProductType, {
    foreignKey: 'type_id'
});

// Product <-> ProductNutrition (One-to-One)
productHasOne(ProductNutrition, {
    foreignKey: 'product_id'
});
nutritionBelongsTo(Product, {
    foreignKey: 'product_id'
});

// Product <-> Flavor (Many-to-Many)
productBelongsToMany(Flavor, {
    through: 'product_flavors',
    foreignKey: 'product_id',
    otherKey: 'flavor_id',
    timestamps: false
});
flavorBelongsToMany(Product, {
    through: 'product_flavors',
    foreignKey: 'flavor_id',
    otherKey: 'product_id',
    timestamps: false
});

// Product <-> ProductAttribute (Many-to-Many)
productBelongsToMany(ProductAttribute, {
    through: 'product_attributes_mapping',
    foreignKey: 'product_id',
    otherKey: 'attribute_id',
    timestamps: false
});
attributeBelongsToMany(Product, {
    through: 'product_attributes_mapping',
    foreignKey: 'attribute_id',
    otherKey: 'product_id',
    timestamps: false
});

// User <-> TrainingSession (One-to-Many)
hasMany(TrainingSession, {
    foreignKey: 'user_id'
});
sessionBelongsTo(User, {
    foreignKey: 'user_id'
});

// User <-> Recommendation (One-to-Many)
hasMany(Recommendation, {
    foreignKey: 'user_id'
});
recommendationBelongsTo(User, {
    foreignKey: 'user_id'
});

// Product <-> Recommendation (One-to-Many)
productHasMany(Recommendation, {
    foreignKey: 'product_id'
});
recommendationBelongsTo(Product, {
    foreignKey: 'product_id'
});

// TrainingSession <-> Recommendation (One-to-Many)
sessionHasMany(Recommendation, {
    foreignKey: 'session_id',
    constraints: false
});
recommendationBelongsTo(TrainingSession, {
    foreignKey: 'session_id',
    allowNull: true,
    constraints: false
});

// --- 4. CONFIGURAR MIDDLEWARES Y RUTAS ---
app.use(cors());
app.use(json());

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import productRoutes from './routes/productRoutes.js';

pool.getConnection()
  .then((conn) => {
    console.log('Database connected!');
    conn.release();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });


app.use('/api/auth', authRoutes);
app.use('/api/users', profileRoutes);
app.use('/api/products', productRoutes);

// --- 5. INICIAR SERVIDOR ---
const PORT = process.env.PORT || 5000;

authenticate()
    .then(() => {
        console.log('Database connection established');
        return sync(); // Sin opciones para solo crear tablas si no existen
    })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Database connection or sync failed:', err);
    });