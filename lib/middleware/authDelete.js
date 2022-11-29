const { Review } = require('../models/Review.js');
// const authenticate = require('../middleware/authenticate');

module.exports = async (req, res, next) => {
  const review = await Review.getById(req.params.id);
  try {
    if (
      req.user &&
      (req.user.id === review.userId || req.user.email === 'admin')
    ) {
      next();
    } else {
      throw new Error('You do not have access to view this page');
    }
  } catch (err) {
    err.status = 403;
    next(err);
  }
};
