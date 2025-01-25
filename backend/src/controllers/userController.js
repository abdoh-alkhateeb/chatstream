import User from '../models/user/UserSchema.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import path from 'path';

export const updateUser = catchAsync(async (req, res, next) => {
  const updateData = req.body;

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({ status: 'success', data: user });
});

// Get Specific User Field
export const getUserField = catchAsync(async (req, res, next) => {
  const { id, field } = req.params;

  // List of allowed fields to access
  const allowedFields = ['name', 'email', 'profile', 'friends', 'address'];

  // Check if the requested field is allowed
  if (!allowedFields.includes(field)) {
    return next(new AppError('Field not found or not accessible', 400)); // Bad request if field is not valid
  }

  const user = await User.findById(id).select(field);

  if (!user || !user.get(field) || field === 'password') {
    return next(new AppError('Field not found', 404));
  }

  res.status(200).json({ status: 'success', data: user.get(field) });
});

// Get User by ID
export const getUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (req.user) {
    res.status(200).json({ status: 'success', data: req.user });
  }

  const user = await User.findById(id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }
  res.status(200).json({ status: 'success', data: user });
});

// Search Users
export const searchUsers = catchAsync(async (req, res, _) => {
  const { query } = req.query;

  const users = await User.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
    ],
  });

  res.status(200).json({ status: 'success', data: users });
});

// Update User Password
export const updatePassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }
  const isMatch = await user.isValidPassword(oldPassword);

  if (!isMatch) {
    return next(new AppError('Old password is incorrect', 400));
  }

  user.password = newPassword;
  await user.save();

  res
    .status(200)
    .json({ status: 'success', message: 'Password updated successfully' });
});

// Deactivate User Account
export const deactivateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { active: false },
    { new: true }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(204).json({ status: 'success', message: 'Account deactivated' });
});

export const updateUserProfile = catchAsync(async (req, res, next) => {
  const { bio, interests, profile_picture } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      'profile.bio': bio,
      'profile.interests': interests,
      'profile.profile_picture': profile_picture,
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({ status: 'success', data: user.profile });
});

/**
 * @desc Get Current User
 * @route GET /auth/me
 */
export const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    user,
  });
});

// Upload Profile Photo Controller
export const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ status: 'error', message: 'No file uploaded' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${
      req.file.filename
    }`;

    // Update the user's profile with the photo URL
    const user = await User.findByIdAndUpdate(
      req.user._id, // Assuming `req.user._id` is set by authentication middleware
      { 'profile.profile_picture': fileUrl },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ status: 'error', message: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      data: { profile_picture: fileUrl },
    });
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
