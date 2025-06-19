import { BaseModel } from './BaseModel.js';
import pool from '../config/db.js';

class ProductType extends BaseModel {
  static tableName = 'product_types';
  static idColumn = 'type_id';

  static async findByCategory(categoryId) {
    const [rows] = await pool.query(
      'SELECT * FROM product_types WHERE category_id = ?',
      [categoryId]
    );
    return rows;
  }

  static async getFullHierarchy() {
    const [types] = await pool.query(`
      SELECT pt.*, pc.name as category_name
      FROM product_types pt
      JOIN product_categories pc ON pt.category_id = pc.category_id
    `);
    return types;
  }
}

export default ProductType;