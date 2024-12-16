const express = require('express');

const router = express.Router();

//Controllers
const paymentController = require('../controllers/paymentController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.get('checkout-session/:cartId',paymentController.getCheckoutSession)

module.exports = router;
