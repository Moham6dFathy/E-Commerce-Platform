const catchAsync = require('../utils/catchAsync');

//Protect Middleware For Check if User still logined
const protect = catchAsync(async (req, res, next) => {
  // Check of Token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer') &&
    req.cookies.refreshToken
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

module.exports = protect;
