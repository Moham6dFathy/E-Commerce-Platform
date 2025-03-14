const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: [true, 'The Product must belong to user'],
  },
  items: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Product',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

const Wishlist = new mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
