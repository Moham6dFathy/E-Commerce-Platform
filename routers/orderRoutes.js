const express = require('express');

const router = express.Router();

// controllers
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

//Middlewares
const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo')


router.use(protect);

router
  .route('/')
  .get(restrictTo('admin'), orderController.getAllOrders)
  .post(orderController.createOrder)
  .delete(restrictTo('admin'), orderController.deleteAllOrders);
router
  .route('/:orderId')
  .get(restrictTo('admin'), orderController.getOrder)
  .patch(orderController.updateOrder)
  .delete(orderController.cancelOrder);

module.exports = router;
