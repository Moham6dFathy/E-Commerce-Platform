const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user'],
  },
  product: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Product',
    required: [true, 'Review must belong to a Product'],
  },
  review: {
    type: String,
    required: [true, 'Review can not be empty!'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

reviewSchema.index({ user: 1, product: -1 }, { unique: true });

const Review = new mongoose.model('review', reviewSchema);

module.exports = Review;
