const Category = require('../models/categoryModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const sharp = require('sharp');

const mongoose = require('mongoose');
const redisClient = require('../utils/caching');

//Image Cover Upload
const memoryStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
};

const upload = multer({
  storage: memoryStorage,
  fileFilter: multerFilter,
});

exports.uploadProductImages = upload.fields([{ name: 'image', maxCount: 1 }]);

exports.resizeImages = catchAsync(async (req, res, next) => {
  //Image of Category
  req.body.image = `Category-${req.params.categoryId}-${Date.now()}-Image.jpeg`;

  await sharp(req.files.image[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`uploads/Categories/${req.body.image}`);

  next();
});

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const cachedCategories = await redisClient.json.get('categories', '$');

  if (cachedCategories) {
    return res.status(200).json({
      status: 'success',
      data: {
        categories: cachedCategories,
      },
    });
  }

  const categories = await Category.aggregate([
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: 'parent',
        as: 'Subcategories',
      },
    },
  ]);

  //cache the categories
  await redisClient.json.set('categories', '$', categories);
  await redisClient.expire('categories', 3600);

  res.status(200).json({
    status: 'success',
    data: {
      categories,
    },
  });
});

exports.getCategory = catchAsync(async (req, res, next) => {
  let category = await Category.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(req.params.categoryId) },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: 'parent',
        as: 'subcategories',
      },
    },
  ]);

  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  res.status(200).json({
    status: 'success',
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
