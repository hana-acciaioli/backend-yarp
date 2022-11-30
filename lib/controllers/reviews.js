const { Router } = require('express');
const authDelete = require('../middleware/authDelete');
const authenticate = require('../middleware/authenticate.js');
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

  .delete('/:id', authenticate, authDelete, async (req, res, next) => {
    try {
      const deleteReview = await Review.deleteById(req.params.id);
      res.json(deleteReview);
    } catch (e) {
      next(e);
    }
  });
