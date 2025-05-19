// models/BaseModel.js (Opcional - para herencia)
import pool from '../config/db.js';

export class BaseModel {
  static tableName = ''; // Sobreescribir en cada modelo

  static async findById(id) {
    const [rows] = await pool.query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await pool.query(`SELECT * FROM ${this.tableName}`);
    return rows;
  }

  // Métodos comunes...
}