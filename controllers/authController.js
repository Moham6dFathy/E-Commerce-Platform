const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const Email = require('../utils/Email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;

  res.cookie('jwt', token, cookieOption);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newCustomer = await User.create(req.body);
  const cart = await Cart.create({
    user: newCustomer._id,
  });
  createSendToken(newCustomer, 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = { ...req.body };

  if (!email || !password) {
    return next(new AppError('You must enter email and password!', 400));
  }
  console.log(email);
  //Check if user is exist
  const customer = await User.findOne({ email }).select('+password');

  if (!customer) {
    return next(new AppError('The email or passowrd is Wrong!', 401));
  }

  //Check if password is correct
  const passwordIsCorrect = await customer.correctPassword(
    password,
    customer.password
  );

  if (!passwordIsCorrect) {
    return next(new AppError('May be email or passowrd is Wrong!', 401));
  }

  createSendToken(customer, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // Check of Token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! please log in to get access', 401)
    );
  }

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );

  const freshUser = await User.findById(decoded.id);
  const cart = await Cart.findOne({ user: freshUser._id });

  if (!freshUser) {
    return next(new AppError('The User is not exist!', 401));
  }

  // if Password is changed
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'The use recently changed password! please log in again.',
        401
      )
    );
  }

  req.user = freshUser;
  req.userCart = cart;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Check the email existed
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('This email is not found!', 404));
  }
  //Create the Url
  const resetToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  try {
    let resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;

    //Send the reset token by email
    await new Email(user, resetUrl).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. try again later!',
        500
      )
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedResetToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedResetToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('The Reset Token Url is expired!', 400));
  }

  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordChangedAt = Date.now();
  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, res);
});
