const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const Cart = require('./cartModel');
const Wishlist = require('./wishlistModel');
const Review = require('./reviewModel');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required!'],
    unique: [true, 'Username must be unique!'],
  },
  email: {
    type: String,
    required: [true, 'Email is required!'],
    unique: [true, 'Email must be unique!'],
    validate: {
      validator: function (v) {
        return validator.isEmail(v);
      },
      message: 'email is not correct!',
    },
  },
  name: {
    type: String,
    required: [true, 'Name is required!'],
  },
  password: {
    type: String,
    required: [true, 'Password is required!'],
    select: false,
    validate: {
      validator: function (v) {
        return validator.isStrongPassword(v);
      },
      message:
        'Password must have minLength 8 and contain at least 1 Uppercase letter and at least 1 Number and at least 1 Symbol',
    },
  },
  confirmPassword: {
    type: String,
    required: [true, 'ConfirmPassword is required!'],
    select: false,
    validate: {
      validator: function (v) {
        return this.password === v;
      },
      message: 'Password is not match with Confirm password',
    },
  },
  address: String,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  role: {
    type: String,
    enum: ['customer', 'seller', 'admin'],
    default: 'customer',
  },
  emailConfirmed: {
    type: Boolean,
    default: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  password,
  correctPassword
) {
  return await bcrypt.compare(password, correctPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.pre('findOneAndDelete', async function (next) {
  const userId = this.getFilter()._id;
  await Cart.deleteOne({ user: userId });
  await Wishlist.deleteOne({ user: userId });
  await Review.deleteOne({ user: Id });
  next();
});

const User = new mongoose.model('User', userSchema);

module.exports = User;
