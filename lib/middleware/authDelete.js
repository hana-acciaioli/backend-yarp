const { Review } = require('../models/Review.js');

module.exports = async (req, res, next) => {
  try {
    const review = await Review.getById(req.params.id);
    console.log('in middleware now', review.userId, req.user.id);
    if (
      !req.user
      //   ||
      //   req.user.email !== 'admin' ||
      //   req.user.id !== review.userId
    )
      throw new Error('You do not have access to view this page');

    next();
  } catch (err) {
    err.status = 403;
    next(err);
  }
};
