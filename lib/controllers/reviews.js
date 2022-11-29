const { Router } = require('express');
// const authorize = require('../middleware/authDelete');
const { Review } = require('../models/Review.js');
module.exports = Router()
  .get('/:id', async (req, res, next) => {
    try {
      const review = await Review.getById(req.params.id);
      if (!review) {
        next();
      }
      res.json(review);
    } catch (e) {
      next(e);
    }
  })

  .delete('/:id', async (req, res, next) => {
    try {
      //   const review = await Review.getById(req.params.id);
      //   console.log('something else', review.userId);
      //   if (req.user.id === review.userId || req.user.email !== 'admin')
      const deleteReview = await Review.deleteById(req.params.id);
      res.json(deleteReview);
    } catch (e) {
      next(e);
    }
  });
