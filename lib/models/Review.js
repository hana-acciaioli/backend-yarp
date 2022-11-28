// const pool = require('../utils/pool');

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
}

module.exports = { Review };
