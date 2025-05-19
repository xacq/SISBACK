const db = require('../config/db').default;

exports.getCategories = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM product_categories');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const [rows] = await db.execute(`
      SELECT p.*, pt.name AS type_name, pt.description AS type_description 
      FROM products p
      JOIN product_types pt ON p.type_id = pt.type_id
      WHERE pt.category_id = ?
    `, [categoryId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

exports.getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;
    const [rows] = await db.execute('SELECT * FROM products WHERE product_id = ?', [productId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener detalles del producto' });
  }
};

exports.getProductNutrition = async (req, res) => {
  try {
    const { productId } = req.params;
    const [rows] = await db.execute('SELECT * FROM product_nutrition WHERE product_id = ?', [productId]);
    res.json(rows[0] || {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener información nutricional' });
  }
};

exports.getProductFlavors = async (req, res) => {
  try {
    const { productId } = req.params;
    const [rows] = await db.execute(`
      SELECT pf.*, f.name 
      FROM product_flavors pf
      JOIN flavors f ON pf.flavor_id = f.flavor_id
      WHERE pf.product_id = ?
    `, [productId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener sabores del producto' });
  }
};

exports.getProductAttributes = async (req, res) => {
  try {
    const { productId } = req.params;
    const [rows] = await db.execute(`
    SELECT pa.*
    FROM product_attributes_mapping pam
    JOIN product_attributes pa ON pam.attribute_id = pa.attribute_id
    WHERE pam.product_id = ?
    `, [productId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener atributos del producto' });
  }
};