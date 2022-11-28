const pool = require('../utils/pool');

class Restaurant {
  id;
  name;
  cost;
  image;
  website;

  constructor(row) {
    this.id = row.id;
    this.name = row.name;
    this.cost = row.cost;
    this.image = row.image;
    this.body = row.body;
  }

  static async getAll() {
    const { rows } = await pool.query('SELECT * from restaurants;');
    return rows.map((row) => new Restaurant(row));
  }
}

module.exports = { Restaurant };
