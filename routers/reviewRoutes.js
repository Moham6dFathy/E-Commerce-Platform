const express = require('express');

const router = express.Router();

//Controllers
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

router.use(authController.protect);
router.use(authController.restrictTo('customer'));

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(reviewController.createReview);

router
  .route('/:reviewId')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;
