const express = require('express');

const router = express.Router();

//Controller
const categoryController = require('../controllers/categoryController');
const authController = require('../controllers/authController');
//Router
const productRouter = require('./productRoutes');

// Products of specific Category
router.use('/:categoryId/products', productRouter);

router
  .route('/')
  .get(categoryController.getAllCategories)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    categoryController.createCategory
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    categoryController.deleteAllCategories
  );

router
  .route('/:categoryId')
  .get(categoryController.getCategory)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    categoryController.uploadProductImages,
    categoryController.resizeImages,
    categoryController.updateCategory
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    categoryController.deleteCategory
  );

module.exports = router;
