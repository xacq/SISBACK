import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from './config/db.js';

const app = express();

// Middlewares (versión moderna)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importación segura de rutas
import authRoutes from './routes/authRoutes.js';
const userProfileRoutes = require('./routes/userProfile');
import productRoutes from './routes/productRoutes.js';
const recommendationRoutes = require('./routes/recommendations');

app.use('/api/auth', authRoutes);
app.use('/api/profile', userProfileRoutes);
app.use('/api/products', productRoutes);
app.use('/api/recommendations', recommendationRoutes); // <-- AÑADIR ESTA LÍNEA

// Inicio del servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

// Manejo de errores global
process.on('unhandledRejection', (err) => {
  console.error('⚠️ Error no manejado:', err);
});