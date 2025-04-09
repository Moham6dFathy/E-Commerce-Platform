const express = require('express');

const router = express.Router();

//Controller
const categoryController = require('../controllers/categoryController');
const authController = require('../controllers/authController');

//Middlewares
const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo')

//Router
const productRouter = require('./productRoutes');

// Products of specific Category
router.use('/:categoryId/products', productRouter);

router
  .route('/')
  .get(categoryController.getAllCategories)
  .post(protect, restrictTo('admin'), categoryController.createCategory)
  .delete(protect, restrictTo('admin'), categoryController.deleteAllCategories);

router
  .route('/:categoryId')
  .get(categoryController.getCategory)
  .patch(
    protect,
    restrictTo('admin'),
    categoryController.uploadProductImages,
    categoryController.resizeImages,
    categoryController.updateCategory
  )
  .delete(protect, restrictTo('admin'), categoryController.deleteCategory);

module.exports = router;
