const express = require('express');

const router = express.Router();

//Controller
const authController = require('../controllers/authController');
const wishlistController = require('../controllers/wishlistController');

router.use(authController.protect);
router.use(authController.restrictTo('customer'));

router
  .route('/')
  .get(wishlistController.getWishlist)
  .post(wishlistController.addItemToWishlist)
  .delete(wishlistController.clearAllItems);
router.route('/:itemId').delete(wishlistController.deleteItemformWishlist);

module.exports = router;
