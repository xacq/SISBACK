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
      // Desestructura todo EXCEPTO dietary_restrictions
      const {
          age, weight, height, gender, activity_level, training_frequency,
          primary_goal, sweat_level, caffeine_tolerance
          // No desestructuramos dietary_restrictions aquí
      } = profileData;
  
      // --- Obtén dietary_restrictions DIRECTAMENTE y con VALOR POR DEFECTO ---
      //   Accede a profileData.dietary_restrictions.
      //   Usa el operador OR (||) para asignar 'no' (o '') si llega como null/undefined.
      const dietaryRestrictionsValue = profileData.dietary_restrictions || 'no';
  
      // Logs para máxima claridad
      console.log('[MODEL] Received profileData:', JSON.stringify(profileData, null, 2));
      console.log('[MODEL] Accessed profileData.dietary_restrictions:', profileData.dietary_restrictions);
      console.log('[MODEL] Using dietaryRestrictionsValue for DB:', dietaryRestrictionsValue, 'Type:', typeof dietaryRestrictionsValue);
      // --- Fin Obtención Segura ---
  
      const sql = `
          INSERT INTO user_profiles (
              user_id, age, weight, height, gender, activity_level,
              training_frequency, primary_goal, sweat_level,
              caffeine_tolerance, dietary_restrictions
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
              age = VALUES(age), weight = VALUES(weight), height = VALUES(height),
              gender = VALUES(gender), activity_level = VALUES(activity_level),
              training_frequency = VALUES(training_frequency), primary_goal = VALUES(primary_goal),
              sweat_level = VALUES(sweat_level), caffeine_tolerance = VALUES(caffeine_tolerance),
              dietary_restrictions = VALUES(dietary_restrictions);
      `;
  
      try {
          // Pasa las variables desestructuradas Y el valor seguro de dietaryRestrictionsValue
          const [result] = await db.execute(sql, [
              userId,
              age, weight, height, gender, activity_level,
              training_frequency, primary_goal, sweat_level,
              caffeine_tolerance,
              dietaryRestrictionsValue // <-- Pasa la variable segura
          ]);
          console.log('[MODEL] Profile save/update result:', result);
          return result;
      } catch (error) {
          console.error('[MODEL] Error executing profile save/update:', error);
          throw error;
      }
  }

  static async getUserProfile(userId) {
      const [rows] = await db.execute(
          'SELECT * FROM user_profiles WHERE user_id = ?',
          [userId]
      );

      // Ya no se necesita split(',') al leer si la DB es ENUM o si manejas el SET como string simple
      const userProfile = rows[0];
      // if (userProfile && typeof userProfile.dietary_restrictions === 'string') {
          // Si necesitas asegurarte de que sea una de las opciones válidas puedes validar aquí
          // pero si es ENUM la DB ya lo asegura. Si es SET y guardaste solo una, estará como string.
      // }

      console.log('[MODEL] Fetched user profile:', userProfile);
      return userProfile;
  }
}

module.exports = User;

