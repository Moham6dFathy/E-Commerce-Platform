const express = require('express');

const router = express.Router();

//Controller
const authController = require('../controllers/authController');
const wishlistController = require('../controllers/wishlistController');

//Middlewares
const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo');

router.use(protect);
router.use(restrictTo('customer'));

router
  .route('/')
  .get(wishlistController.getWishlist)
  .post(wishlistController.addItemToWishlist)
  .delete(wishlistController.clearAllItems);
router.route('/:itemId').delete(wishlistController.deleteItemformWishlist);

module.exports = router;
