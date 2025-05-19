import { BaseModel } from './BaseModel.js';

class TrainingSession extends BaseModel {
  static tableName = 'training_sessions';

  static async findByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT * FROM ${this.tableName} WHERE user_id = ? ORDER BY date DESC`,
      [userId]
    );
    return rows;
  }

  static async createSession({ userId, duration, exercises }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [sessionResult] = await connection.query(
        'INSERT INTO training_sessions (user_id, duration) VALUES (?, ?)',
        [userId, duration]
      );

      const sessionId = sessionResult.insertId;
      
      for (const exercise of exercises) {
        await connection.query(
          'INSERT INTO session_exercises (session_id, exercise_id, sets, reps) VALUES (?, ?, ?, ?)',
          [sessionId, exercise.id, exercise.sets, exercise.reps]
        );
      }

      await connection.commit();
      return this.findById(sessionId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default TrainingSession;