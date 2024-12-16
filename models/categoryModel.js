const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required!'],
    unique: [true, 'Category name is unique!'],
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
  },
  active: {
    type: Boolean,
    default: true,
  },
});

categorySchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

categorySchema.pre(/^findOneAnd/, function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Category = new mongoose.model('Category', categorySchema);

module.exports = Category;
