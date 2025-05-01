  const db = require('../config/db');

  class User {
    static async create({ username, email, password }) {
      const [result] = await db.execute(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, password]
      );
      return result;
    }
  
    static async findByEmail(email) {
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0];
    }
  
    static async createUserProfile(userId, profileData) {
      const {
        age,
        weight,
        height,
        gender,
        activity_level,
        training_frequency,
        primary_goal,
        sweat_level,
        caffeine_tolerance,
        dietary_restrictions
      } = profileData;
  
      const [result] = await db.execute(
        `INSERT INTO user_profiles (
          user_id, age, weight, height, gender, activity_level,
          training_frequency, primary_goal, sweat_level,
          caffeine_tolerance, dietary_restrictions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          age,
          weight,
          height,
          gender,
          activity_level,
          training_frequency,
          primary_goal,
          sweat_level,
          caffeine_tolerance,
          dietary_restrictions.join(',')
        ]
      );
      return result;
    }
  
    static async getUserProfile(userId) {
      const [rows] = await db.execute(
        'SELECT * FROM user_profiles WHERE user_id = ?',
        [userId]
      );
      return rows[0];
    }
  }
  
  module.exports = User;

