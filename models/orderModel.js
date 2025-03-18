const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
  },
  items: [
    {
      product: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Product',
      },
      quantity: {
        type: Number,
        required: [true, 'You must select quantity of item'],
      },
    },
  ],
  shippingAddress: {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },
  shippingMethod: {
    type: String,
    required: true,
    enum: ['Normal', 'Express'],
  },
  shippingCost: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Credit Card', 'On delivery'],
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'failed'],
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'canceled'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

const Order = new mongoose.model('order', orderSchema);

module.exports = Order;
