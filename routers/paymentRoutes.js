const express = require('express');

const router = express.Router();

//Controllers
const paymentController = require('../controllers/paymentController');
const authController = require('../controllers/authController');

router.use(authController.protect);


module.exports = router;
