const express = require('express');

const router = express.Router();

//Controllers
const authController = require('../controllers/authController');
const cartController = require('../controllers/cartController');

router.use(authController.protect);
router.use(authController.restrictTo('customer'));

router.route('/').get(cartController.getCart).post(cartController.addCartItem);

router
  .route('/:itemId')
  .patch(cartController.updateCartItem)
  .delete(cartController.deleteCartItem);

module.exports = router;
