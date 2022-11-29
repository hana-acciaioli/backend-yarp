const { Router } = require('express');
const authenticate = require('../middleware/authenticate.js');
const { Review } = require('../models/Review.js');

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

module.exports = Router()
  .get('/:id', async (req, res, next) => {
    try {
      const review = await Review.getById(req.params.id);
      res.json(review);
    } catch (e) {
      next(e);
    }
  })

  .delete('/:id', authenticate, async (req, res, next) => {
    try {
      const review = await Review.getById(req.params.id);
      if (req.user.id === review.userId || req.user.email !== 'admin')
        res
          .clearCookie(process.env.COOKIE_NAME, {
            httpOnly: true,
            secure: process.env.SECURE_COOKIES === 'true',
            sameSite: process.env.SECURE_COOKIES === 'true' ? 'none' : 'strict',
            maxAge: ONE_DAY_IN_MS,
          })
          .status(204)
          .send();
    } catch (e) {
      next(e);
    }
  });
