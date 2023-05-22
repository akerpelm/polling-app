const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

// @desc  Register user
// @route POST /api/v1/auth/register
// @access  Public
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, address } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role,
    address
  });

  // Create token
  sendTokenResponse(user, 200, res);
});

// @desc  Login user
// @route POST /api/v1/auth/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check password match
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Create token
  sendTokenResponse(user, 200, res);
});

// @desc  Logout user / clear cookies
// @route GET /api/v1/auth/logout
// @access  Private
exports.logoutUser = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc  Reset password
// @route POST /api/v1/auth/recover-password/:resetToken
// @access  Private
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  // Create token
  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie, send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token
  });
};

// @desc  Get current logged in user
// @route POST /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc  Update user details
// @route PUT /api/v1/auth/update-details
// @access  Private
exports.updateUserDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });
});

// @desc  Update password
// @route POST /api/v1/auth/update-password
// @access  Private
exports.updateUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Invalid password', 401));
  }
  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc  Recover password
// @route POST /api/v1/auth/recover-password
// @access  Public
// exports.recoverPassword = asyncHandler(async (req, res, next) => {
//   const user = await User.findOne({ email: req.body.email });

//   if (!user) {
//     return next(new ErrorResponse('There is no user with that email', 404));
//   }

//   const resetToken = user.getResetPasswordToken();

//   await user.save({ validateBeforeSave: false });

//   // Create reset url
//   const resetUrl = `${req.protocol}://${req.get(
//     'host'
//   )}/api/v1/auth/recover-password/${resetToken}`;
//   const message = `You are receiving this email because you (or someone else) has requested the rest of a password. Please make a PUT request to : \n\n ${resetUrl}`;

//   try {
//     await sendEmail({
//       email: user.email,
//       subject: 'Password Reset Token - DevCamper',
//       message
//     });
//     res.status(200).json({ success: true, data: 'Email sent' });
//   } catch (err) {
//     console.log(err);
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;

//     await user.save({ validateBeforeSave: false });
//     return next(new ErrorResponse('Email could not be sent', 500));
//   }

//   res.status(200).json({
//     success: true,
//     data: user
//   });
// });
