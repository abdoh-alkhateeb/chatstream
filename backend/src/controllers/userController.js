import User from '../models/user/UserSchema.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import ensureOwnership from '../utils/roleCheck.js';

export const updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  ensureOwnership(id, req.user._id, next);

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({ status: 'success', data: user });
});

// 🛠️ Get Specific User Field
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

  res.status(200).json({ status: 'success', data: user.get(field) },);
});

// 🛠️ Get User by ID
export const getUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({ status: 'success', data: user });
});

// 🛠️ Search Users
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

// 🛠️ Update User Password
export const updatePassword = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  ensureOwnership(id, req.user._id, next);

  const user = await User.findById(id).select('+password');

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

// 🛠️ Deactivate User Account
export const deactivateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  ensureOwnership(id, req.user._id, next);

  const user = await User.findByIdAndUpdate(
    id,
    { active: false },
    { new: true }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(204).json({ status: 'success', message: 'Account deactivated' });
});

export const updateUserProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Authorization: Ensure only the owner can update their profile
  ensureOwnership(id, req.user._id, next);

  const { bio, interests, profile_picture } = req.body;

  const user = await User.findByIdAndUpdate(
    id,
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
