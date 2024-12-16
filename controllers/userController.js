const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({ active: { $ne: false } });

  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

exports.createNewUser = catchAsync(async (req, res, next) => {
  if (Object.hasOwn(req.body, 'role')) {
    req.body.role = undefined;
  }
  const userInfo = await User.create(req.body);

  userInfo.cofirmPassword = undefined;

  res.status(200).json({
    status: 'success',
    data: {
      userInfo,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('Not found user with this id', 400));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const body = req.body;

  if (Object.hasOwn(body, 'password')) {
    return next(new AppError("You can't change password in this request"));
  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.params.id,
    {
      active: false,
    },
    {
      runValidators: true,
    }
  );

  res.status(204).json({
    status: 'success',
    message: 'User was deleted!',
  });
});

exports.deleteAllUsers = catchAsync(async (req, res, next) => {
  await User.deleteMany({});

  res.status(204).json({
    status: 'success',
    message: 'Users deleted',
  });
});
