const express = require('express');

const router = express.Router();

//Controllers
const paymentController = require('../controllers/paymentController');
const authController = require('../controllers/authController');

//Middlewares
const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo')


router.use(protect);

router.use(restrictTo('admin'));

router.patch('/refund/:pi', paymentController.refundPayment);

router.route('/').get(paymentController.findAllPayments);
router
  .route('/:id')
  .get(paymentController.findPayment)
  .patch(paymentController.updatePayment)
  .delete(paymentController.deletePayment);

module.exports = router;
