const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required!'],
  },
  amount: {
    type: Number,
    required: [true, 'Product amount is required!'],
  },
  brand: {
    type: String,
    required: [true, 'Product brand is required!'],
  },
  currency: {
    type: String,
    required: [true, 'Product Currency is required'],
  },
  imageCover: {
    type: String,
  },
  images: [
    {
      type: String,
    },
  ],
  reviews: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Review',
    },
  ],
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: [true, 'Product price is required!'],
  },
  discount: {
    type: Number,
    default: 0,
  },
  category: {
    type: mongoose.SchemaTypes.ObjectId,
    required: [true, 'Product category is required!'],
    ref: 'Category',
  },
  specifications: {
    type: String,
  },
});

productSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'category',
    select: '_id name',
  });
  next();
});

const Product = new mongoose.model('Product', productSchema);

module.exports = Product;
