import { BaseModel } from './BaseModel.js';

class User extends BaseModel {
  static tableName = 'users';

  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async create({ name, email, password }) {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );
    return this.findById(result.insertId);
  }
}

export default User;