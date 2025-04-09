const mongoose = require('mongoose');
const redisClient = require('../utils/caching');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required!'],
  },
  quantity: {
    type: Number,
    required: [true, 'Product quantity is required!'],
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
    required: false,
    ref: 'Category',
  },
  specifications: {
    type: String,
  },
  slug: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

productSchema.pre('save', async function (next) {
  this.slug = this.title.toLowerCase();
  await redisClient.del('products');
  next();
});
productSchema.pre(/^findOneAnd/, async function (next) {
  this.set({ updatedAt: Date.now() });
  await redisClient.del('products');
  next();
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
