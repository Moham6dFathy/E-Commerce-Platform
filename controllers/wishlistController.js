const Product = require('../models/productModel');
const Wishlist = require('../models/wishlistModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getWishlist = catchAsync(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    return next(new AppError('wishlist not found!,please login', 400));
  }

  res.status(200).json({
    status: 'success',
    data: {
      wishlist,
    },
  });
});

exports.addItemToWishlist = catchAsync(async (req, res, next) => {
  //Get the wishlist
  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    return next(new AppError('wishlist not found!,please login', 400));
  }

  const product = await Product.findById(req.body.product);

  if (!product) {
    return next(new AppError('Product is not found', 400));
  }

  let found = false;
  // if Product is actually in The Wishlist
  wishlist.items.forEach((item) => {
    if (item.toString() === req.body.product) {
      found = true;
    }
  });

  // if Product is not exist in The Wishlist
  if (!found) wishlist.items.push(req.body.product);

  wishlist.updatedAt = Date.now();
  await wishlist.save();

  const updatedwishlist = await Wishlist.findOne({ user: req.user._id });

  res.status(201).json({
    status: 'success',
    data: {
      updatedwishlist,
    },
  });
});

exports.deleteItemformWishlist = catchAsync(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    return next(new AppError('wishlist not found!,please login', 400));
  }
  // delete item form wishlist
  wishlist.items = wishlist.items.filter((el) => {
    return el != req.params.itemId;
  });

  wishlist.updatedAt = Date.now();

  // save wishlist
  await wishlist.save();

  res.status(204).json({
    status: 'success',
    message: 'Item is been deleted',
  });
});

exports.clearAllItems = catchAsync(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    return next(new AppError('wishlist not found!,please login', 400));
  }
  // delete item form wishlist
  wishlist.items = [];

  wishlist.updatedAt = Date.now();
  // save wishlist
  await wishlist.save();

  res.status(204).json({
    status: 'success',
    message: 'Item is been deleted',
  });
});
