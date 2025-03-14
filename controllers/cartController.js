const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.addCartItem = catchAsync(async (req, res, next) => {
  // get the user cart
  const cart = await Cart.findOne({ user: req.user._id });
  // get the product
  const product = await Product.findById(req.body.product);

  // if Product is not found
  if (!product) {
    return next(new AppError('Product is not found', 400));
  }

  // if quantity that add more than the capacity of product
  if (req.body.quantity > product.quantity) {
    return next(new AppError('The quantity of product is not enough', 400));
  }

  const newItem = {
    product: req.body.product,
    quantity: req.body.quantity,
  };

  let found = false;
  // if Product is actually in The Cart
  cart.items = cart.items.map((item) => {
    if (item.product.toString() === req.body.product) {
      found = true;
      newItem.quantity += item.quantity;
      return newItem;
    }
    return item;
  });

  // if Product is not exist in The cart
  if (!found) cart.items.push(newItem);

  // save Cart
  await cart.save();

  res.status(201).json({
    status: 'success',
    data: {
      cart,
    },
  });
});

exports.getCart = catchAsync(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user._id });
  cart = cart.toObject();

  const updatedItems = await Promise.all(
    cart.items.map(async (item) => {
      const product = await Product.findById(item.product);
      const priceAfterDiscount =
        product.price - (product.price * product.discount) / 100;
      const itemTotalPrice = priceAfterDiscount * item.quantity;

      return {
        ...item, // Preserve other item properties
        priceAfterDiscount, // Add price after discount
        itemTotalPrice, // Add total price for the item
      };
    })
  );

  const totalPrice = updatedItems.reduce(
    (sum, item) => sum + item.itemTotalPrice,
    0
  );

  cart.items = updatedItems;
  cart.totalPrice = totalPrice;

  res.status(200).json({
    status: 'success',
    data: {
      cart,
    },
  });
});

exports.updateCartItem = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  let item;
  cart.items.forEach((it) => {
    if (it._id.toString() === req.params.itemId) item = it;
  });

  const product = await Product.findById(item.product);

  if (!product) {
    return next(new AppError('The Product is not found', 400));
  }

  const { quantity } = req.body;

  // if quantity that add more than the capacity of product
  if (quantity > product.quantity) {
    return next(new AppError('The quantity of product is not enough', 400));
  }

  cart.items = cart.items.map((item) => {
    if (item._id.toString() === req.params.itemId) {
      item.quantity = quantity;
    }
    return item;
  });
  cart.updatedAt = Date.now();
  await cart.save();

  res.status(200).json({
    status: 'success',
    data: {
      item,
    },
  });
});

exports.deleteCartItem = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  cart.items = cart.items.filter(function (obj) {
    return obj._id != req.params.itemId;
  });
  await cart.save();

  res.status(204).json({
    status: 'success',
    message: 'item is been deleted!',
  });
});
