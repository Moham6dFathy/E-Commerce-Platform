const mongoose = require('mongoose');
const redisClient = require('../utils/caching');
const slugify = require('slugify');
const Product = require('./productModel');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required!'],
    unique: [true, 'Category name is unique!'],
  },
  parent: {
    type: mongoose.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  description: {
    type: String,
  },
  image: {
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
  active: {
    type: Boolean,
    default: true,
  },
});

//Indexes
categorySchema.index({ parent: 1 });

categorySchema.pre('save', async function (next) {
  this.slug = slugify(this.name, { lower: true });
  await redisClient.del('categories');
  next();
});

categorySchema.pre(/^findOneAnd/, async function (next) {
  this.set({ updatedAt: Date.now() });
  await redisClient.del('categories');
  next();
});

categorySchema.pre('findOneAndDelete', async function (next) {
  const categoryId = this.getFilter()._id;
  await Product.updateMany(
    { category: categoryId },
    { $unset: { category: '' } },
    {
      runValidators: true,
    }
  );

  await redisClient.del('categories');

  next();
});

const Category = new mongoose.model('Category', categorySchema);

module.exports = Category;
