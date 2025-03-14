const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Product = require('../models/productModel');
const multer = require('multer');
const sharp = require('sharp');
const APIFeatures = require('../utils/APIFeatures');

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

exports.uploadProductImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 7 },
]);

exports.resizeImages = catchAsync(async (req, res, next) => {
  //Cover
  req.body.imageCover = `product-${req.params.productId}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`uploads/Products/${req.body.imageCover}`);

  // Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `product-${req.params.productId}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`uploads/Products/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

exports.getAllProducts = catchAsync(async (req, res, next) => {
  let filter = {};
  //if need to get products of Category
  if (req.params.categoryId) filter = { category: req.params.categoryId };

  // Filter, Sort, limitFileds, pagination of Products
  const features = new APIFeatures(Product.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  //get the products
  const products = await features.query;

  res.status(200).json({
    status: 'success',
    data: {
      products,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);

  if (!product) return next(new AppError('Not found a product!', 400));

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  if (req.params.categoryId) req.body.category = req.params.categoryId;
  const newProduct = await Product.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      newProduct,
    },
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  console.log(req.file);
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.productId,
    req.body,
    {
      new: true,
      runValidator: true,
    }
  );

  res.status(201).json({
    status: 'success',
    data: {
      updatedProduct,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  await Product.findByIdAndDelete(req.params.productId);

  res.status(204).json({
    status: 'success',
    message: 'product deleted Successfully',
  });
});

exports.deleteAllProducts = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.categoryId) filter = { category: req.params.categoryId };
  await Product.deleteMany(filter);

  res.status(204).json({
    status: 'success',
    message: 'All products deleted Successfully',
  });
});
