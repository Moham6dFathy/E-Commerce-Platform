const mongoose = require('mongoose');
const Product = require('./productModel');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: [true, 'Cart show belong to a user'],
  },
  items: [
    {
      product: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      }
    },
  ],
  totalItems: { type: Number, default: 0 },
  totalQuantities: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// calculate the total items and total Quantities
cartSchema.pre('save', function (next) {
  this.totalItems = this.items.length;
  this.totalQuantities = 0;
  this.items.forEach((element) => {
    this.totalQuantities += element['quantity'];
  });
  next();
});

cartSchema.pre(/^find/, function (next) {
  // this.populate('items.productId');
  next();
});

const Cart = new mongoose.model('Cart', cartSchema);

module.exports = Cart;
