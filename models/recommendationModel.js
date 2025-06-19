import { BaseModel } from './BaseModel.js';
import pool from '../config/db.js';

class Recommendation extends BaseModel {
  static tableName = 'recommendations';
  static idColumn = 'recommendation_id';

  static async getPersonalized(userId, limit = 5) {
    const [recommendations] = await pool.query(`
      SELECT r.*, p.name as product_name, p.price
      FROM recommendations r
      JOIN products p ON r.product_id = p.product_id
      WHERE r.user_id = ?
      ORDER BY r.score DESC
      LIMIT ?
    `, [userId, limit]);
    return recommendations;
  }

  static async logInteraction(userId, productId, action = 'view') {
    const [result] = await pool.query(
      `INSERT INTO recommendation_interactions 
        (user_id, product_id, action)
        VALUES (?, ?, ?)`,
      [userId, productId, action]
    );
    return result.insertId;
  }
}

export default Recommendation;