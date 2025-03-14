const express = require('express');

const router = express.Router();

// controllers
const orderController = require('../controllers/orderController');
const paymentController = require('../controllers/paymentController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router
  .route('/')
  .get(authController.restrictTo('admin'), orderController.getAllOrders)
  .post(orderController.createOrder)
  .delete(authController.restrictTo('admin'), orderController.deleteAllOrders);
router
  .route('/:orderId')
  .get(authController.restrictTo('admin'), orderController.getOrder)
  .patch(orderController.updateOrder)
  .delete(orderController.cancelOrder);

module.exports = router;
