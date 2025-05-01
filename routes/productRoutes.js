const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/categories', productController.getCategories);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/:productId', productController.getProductDetails);
router.get('/:productId/nutrition', productController.getProductNutrition);
router.get('/:productId/flavors', productController.getProductFlavors);
router.get('/:productId/attributes', productController.getProductAttributes);

module.exports = router;