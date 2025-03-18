const catchAsync = require('../utils/catchAsync');
const Order = require('../models/orderModel');
const Payment = require('../models/paymentModel');
const paymentController = require('../controllers/paymentController');
const Product = require('../models/productModel');
const AppError = require('../utils/AppError');
const Cart = require('../models/cartModel');

exports.createOrder = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!Array.isArray(cart.items) || !cart.items.length) {
    return next(new AppError('The Cart is Empty', 400));
  }

  const orderBody = {
    cart,
    ...req.body,
  };

  if (req.body.paymentMethod === 'On delivery') {
    Object.assign(orderBody, {
      items: cart.items,
      paymentStatus: 'pending',
    });

    const order = await Order.create(orderBody);

    if (order) {
      // update quantities of products
      await Promise.all(
        order.items.map(async (item) => {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { quantity: -item.quantity } },
            {
              new: true,
              runValidators: true,
            }
          );
        })
      );

      //Clear Cart after order done
      cart.items = [];
      cart.updatedAt = Date.now();
      await cart.save();

      return res.status(201).json({
        status: 'success',
        message: 'Order Added Successfully',
        data: {
          order,
        },
      });
    }
  }

  const stripeSession = await paymentController.getCheckoutSession(req, order);

  res.status(201).json({
    status: 'success',
    message: 'The checkout session is opening!',
    data: {
      stripeSession,
    },
  });
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find();

  res.status(200).json({
    status: 'success',
    length: orders.length,
    data: {
      orders,
    },
  });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return next(new AppError('The Order is not found !', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});

exports.updateOrder = catchAsync(async (req, res, next) => {});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByIdAndUpdate(
    { _id: req.params.orderId },
    { status: 'canceled' },
    {
      runValidators: true,
    }
  );

  if (!order) {
    return next(new AppError('Order is not found!', 404));
  }

  res.status(204).json({
    status: 'success',
  });
});

exports.deleteAllOrders = catchAsync(async (req, res, next) => {
  await Order.deleteMany();

  res.status(204).json({
    status: 'success',
  });
});
