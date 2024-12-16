const catchAsync = require('../utils/catchAsync');
const Order = require('../models/orderModel');

exports.createOrder = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  const order = await Order.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      order,
    },
  });
});
