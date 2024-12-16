const express = require('express');

const router = express.Router();

// controllers
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.route('/').get().post(orderController.createOrder).delete();
router.route('/orderId').get().patch().delete();

module.exports = router;
