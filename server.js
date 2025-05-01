require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rutas
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const productRoutes = require('./routes/productRoutes'); // Nueva línea

app.use('/api/auth', authRoutes);
app.use('/api/users', profileRoutes);
app.use('/api/products', productRoutes); // Nueva línea

const PORT = process.env.PORT || 5000;
app.listen(PORT,() => {
  console.log(`Server running on port ${PORT}`);
});