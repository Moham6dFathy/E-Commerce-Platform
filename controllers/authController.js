const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const Email = require('../utils/Email');
const crypto = require('crypto');
const Wishlist = require('../models/wishlistModel');

// return the token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const confirmationToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET_KEY, {
    expiresIn: '1h',
  });
};

// Send Token and save it in Cookies
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

const sendEmailConfirmationUrl = async (user) => {
  //Generate a token which has a email of user and attach it in email
  const token = confirmationToken(user.email);

  //Generate url that will send
  const url = `http://127.0.0.1:3000/api/v1/users/verify-email/${token}`;

  //Send email for a user
  await new Email(user, url).sendVerifcationEmailUrl();
};

// Signup
exports.signUp = catchAsync(async (req, res, next) => {
  const newCustomer = await User.create(req.body);
  //Create a cart for a new user
  await Cart.create({
    user: newCustomer._id,
  });
  //Create a wishlist for a new user
  await Wishlist.create({
    user: newCustomer._id,
  });

  //Send Welcome Email
  await new Email(newCustomer).sendWelcome();

  //Send Email Verifcation Url
  sendEmailConfirmationUrl(newCustomer);
  newCustomer.password = undefined;
  createSendToken(newCustomer, 200, res);
});

//Login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = { ...req.body };

  // if User isn't Enter The Email And Password
  if (!email || !password) {
    return next(new AppError('You must enter email and password!', 400));
  }

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
  customer.password = undefined;
  createSendToken(customer, 200, res);
});

//Log out
exports.logout = catchAsync(async (req, res, next) => {
  res.clearCookie('jwt', { httpOnly: true, secure: true });

  res.status(200).json({
    status: 'success',
    message: 'logged out successfully',
  });
});

//Protect Middleware For Check if User still logined
exports.protect = catchAsync(async (req, res, next) => {
  // Check of Token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer') &&
    req.cookies.jwt
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  //If user not log in
  if (!token) {
    return next(
      new AppError('You are not logged in! please log in to get access', 401)
    );
  }

  //Check if Token is Valid
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );

  //Check if user exist in Database
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

  //put user in request(easy for access)
  req.user = freshUser;
  req.userCart = cart;
  next();
});

// Restrict To
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

// Forgot Password Logic
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

// Reset Password Logic
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

exports.changePassword = catchAsync(async (req, res, next) => {
  const { password, confirmPassword } = { ...req.body };

  // if Password or Confirmpassword not exist
  if (!password || !confirmPassword) {
    return next(new AppError('You must enter the password', 400));
  }

  let user = await User.findById(req.user._id).select('+password');

  //Check if Current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // Update Password
  try {
    user.password = password;
    user.confirmPassword = confirmPassword;
    user.passwordChangedAt = Date.now();
    await user.save();
  } catch (err) {
    return next(new AppError(err.message, err.statusCode));
  }

  createSendToken(user, 200, res);
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  //Check the token
  const { token } = req.params;

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const user = await User.findOne({ email: decoded.email });
  if (!user) {
    return next(new AppError('user not found', 404));
  }
  user.emailConfirmed = true;

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Congratulations,Your account is verified!',
  });
});
