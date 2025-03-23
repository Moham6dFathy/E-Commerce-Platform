const express = require('express');

const router = express.Router();

//Controllers
const paymentController = require('../controllers/paymentController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.use(authController.restrictTo('admin'));

route.patch('/refund/:pi', paymentController.refundPayment);

router.route('/').get(paymentController.findAllPayments);
router
  .route('/id')
  .get(paymentController.findPayment)
  .patch(paymentController.updatePayment)
  .delete(paymentController.deletePayment);

module.exports = router;
