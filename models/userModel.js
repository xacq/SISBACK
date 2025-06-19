import { BaseModel } from './BaseModel.js';
import pool from '../config/db.js';

class User extends BaseModel {
  static tableName = 'users';
  static idColumn = 'user_id';

  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async create({ username, email, password }) {
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password]
    );
    return this.findById(result.insertId);
  }
}

export default User;