const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const Categories = await Category.find({ active: { $ne: false } });

  res.status(200).json({
    status: 'success',
    message: 'All Categories',
    data: {
      Categories,
    },
  });
});

exports.getCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.categoryId);

  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: `A ${category.name} Category`,
    data: {
      category,
    },
  });
});

exports.createCategory = catchAsync(async (req, res, next) => {
  const category = await Category.create(req.body);

  res.status(200).json({
    status: 'success',
    message: `${category.name} is been Created!`,
    data: {
      category,
    },
  });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(
    req.params.categoryId,
    req.body,
    {
      new: true,
      runValidator: true,
    }
  );

  res.status(200).json({
    status: 'success',
    message: `${category.name} is been Updated!`,
    data: {
      category,
    },
  });
});

exports.deleteAllCategories = catchAsync(async (req, res, next) => {
  await Category.deleteMany({});

  res.status(204).json({
    status: 'success',
    message: `All Categories deleted`,
  });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.categoryId);

  res.status(204).json({
    status: 'success',
    message: `${category.name} was deleted`,
  });
});

