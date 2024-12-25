import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user/UserSchema.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { generateToken } from '../utils/jwt.js';

/**
 * @desc Register New User
 * @route POST /auth/signup
 */
export const signup = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return next(new AppError('Please provide name, email, and password', 400));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }

  // Create new user
  const newUser = await User.create({
    name,
    email,
    password,
  });

  // Generate JWT token
  try {
    const token = generateToken(newUser._id);

    res.status(201);
    res.json({
      status: 'success',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    await User.deleteOne({ _id: newUser._id });
    next(new AppError('JWTError: ' + error.message, 500));
  }
});

/**
 * @desc Login User
 * @route POST /auth/login
 */
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Find user by email
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Generate JWT token
  try {
    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    next(new AppError('JWTError: ' + error.message, 500));
  }
});

/**
 * @desc Logout User
 * @route POST /auth/logout
 */
export const logout = catchAsync(async (req, res) => {
  // pass
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

/**
 * @desc Get Current User
 * @route GET /auth/me
 */
export const getMe = catchAsync(async (req, res, next) => {
  const token = req.header('authorization')?.replace('Bearer ', '');

  if (!token) {
    return next(new AppError('No token provided', 401));
  }

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    user,
  });
});
