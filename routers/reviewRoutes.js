const express = require('express');

const router = express.Router();

//Controllers
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

//Middlewares
const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo')


router.use(protect);
router.use(restrictTo('customer'));

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
