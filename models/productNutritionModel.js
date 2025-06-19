import { BaseModel } from './BaseModel.js';

class ProductNutrition extends BaseModel {
  static tableName = 'product_nutrition';
  static idColumn = 'nutrition_id';

  static async getByProduct(productId) {
    const [nutrition] = await pool.query(
      'SELECT * FROM product_nutrition WHERE product_id = ?',
      [productId]
    );
    return nutrition[0] || null;
  }

  static async updateOrCreate(productId, data) {
    const existing = await this.getByProduct(productId);
    if (existing) {
      const [result] = await pool.query(
        `UPDATE ${this.tableName} SET
          serving_size = ?,
          energy_kcal = ?,
          protein_g = ?,
          carbs_g = ?,
          sugars_g = ?,
          sodium_mg = ?,
          potassium_mg = ?,
          magnesium_mg = ?,
          caffeine_mg = ?,
          other_components = ?
          WHERE product_id = ?`,
        [
          data.serving_size,
          data.energy_kcal,
          data.protein_g,
          data.carbs_g,
          data.sugars_g,
          data.sodium_mg,
          data.potassium_mg,
          data.magnesium_mg,
          data.caffeine_mg,
          data.other_components,
          productId
        ]
      );
      return result.affectedRows > 0;
    } else {
      const [result] = await pool.query(
        `INSERT INTO ${this.tableName}
          (
            product_id,
            serving_size,
            energy_kcal,
            protein_g,
            carbs_g,
            sugars_g,
            sodium_mg,
            potassium_mg,
            magnesium_mg,
            caffeine_mg,
            other_components
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productId,
          data.serving_size,
          data.energy_kcal,
          data.protein_g,
          data.carbs_g,
          data.sugars_g,
          data.sodium_mg,
          data.potassium_mg,
          data.magnesium_mg,
          data.caffeine_mg,
          data.other_components
        ]
      );
      return result.insertId;
    }
  }
}

export default ProductNutrition;