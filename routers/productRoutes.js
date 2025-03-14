const express = require('express');

//Models
const Product = require('../models/productModel');

//Controllers
const productController = require('../controllers/productController');
const reveiwRoute = require('./reviewRoutes');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(
  '/review',
  authController.protect,
  authController.restrictTo('customer'),
  reveiwRoute
);

router
  .route('/')
  .get(productController.getAllProducts)
  .post(
    authController.protect,
    authController.restrictTo('seller', 'admin'),
    productController.createProduct
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    productController.deleteAllProducts
  );

router
  .route('/:productId')
  .get(productController.getProduct)
  .patch(
    authController.protect,
    authController.restrictTo('seller', 'admin'),
    productController.uploadProductImages,
    productController.resizeImages,
    productController.updateProduct
  )
  .delete(
    authController.protect,
    authController.restrictTo('seller', 'admin'),
    productController.deleteProduct
  );

module.exports = router;
