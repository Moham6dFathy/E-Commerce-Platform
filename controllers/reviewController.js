const Product = require('../models/productModel');
const Review = require('../models/reviewModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

//TODO Check if Customer buy the product
exports.createReview = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  const review = await Review.create(req.body);
  const product = await Product.findById(req.body.product);

  if (!product) {
    return next(new AppError('Product not found', 400));
  }

  product.reviews.push(review._id);
  await product.save();

  res.status(201).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();

  res.status(200).json({
    status: 'success',
    data: {
      reviews,
    },
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    return next(new AppError('review not found', 400));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.reviewId, req.body, {
    runValidator: true,
    new: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'Review is been updated',
    data: {
      review,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  await Review.findByIdAndDelete(req.params.reviewId);

  res.status(204).json({
    status: 'success',
    message: 'Review is been deleted',
  });
});
