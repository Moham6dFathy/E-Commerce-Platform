const express = require('express');

//Models
const Product = require('../models/productModel');

//Controllers
const productController = require('../controllers/productController');
const reveiwRoute = require('./reviewRoutes');
const authController = require('../controllers/authController');

//Middlewares
const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo')


const router = express.Router({ mergeParams: true });

router.use('/review', protect, restrictTo('customer'), reveiwRoute);

router
  .route('/')
  .get(productController.getAllProducts)
  .post(protect, restrictTo('seller', 'admin'), productController.createProduct)
  .delete(protect, restrictTo('admin'), productController.deleteAllProducts);

router
  .route('/:productId')
  .get(productController.getProduct)
  .patch(
    protect,
    restrictTo('seller', 'admin'),
    productController.uploadProductImages,
    productController.resizeImages,
    productController.updateProduct
  )
  .delete(
    protect,
    restrictTo('seller', 'admin'),
    productController.deleteProduct
  );

module.exports = router;
