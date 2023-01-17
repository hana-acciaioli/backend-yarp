// const pool = require('../utils/pool');

const pool = require('../utils/pool.js');

class Review {
  id;
  userId;
  restaurantId;
  stars;
  detail;

  constructor(row) {
    this.id = row.id;
    this.userId = row.user_id;
    this.restaurantId = row.restaurant_id;
    this.stars = row.stars;
    this.detail = row.detail;
  }

  static async deleteById(id) {
    const { rows } = await pool.query(
      'DELETE from reviews WHERE id = $1 RETURNING *',
      [id]
    );
    return new Review(rows[0]);
  }
  static async insert({ userId, restaurantId, stars, detail }) {
    const { rows } = await pool.query(
      'INSERT INTO reviews (user_id, restaurant_id, stars, detail) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, restaurantId, stars, detail]
    );
    return new Review(rows[0]);
  }

  static async getById(id) {
    const { rows } = await pool.query('SELECT * from reviews WHERE id = $1', [
      id,
    ]);
    if (rows.length === 0) {
      return null;
    }
    return new Review(rows[0]);
  }
}

module.exports = { Review };
