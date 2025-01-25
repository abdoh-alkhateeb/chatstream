import express from 'express';
import {
  updateUser,
  getUserField,
  getUserById,
  searchUsers,
  updatePassword,
  deactivateUser,
  updateUserProfile,
  uploadProfilePhoto,
} from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import Joi from 'joi';
import validate from '../middlewares/validateMiddleware.js';
import { getMe } from '../controllers/authController.js';
import upload, { ensureUploadsFolder } from '../middlewares/upload.js';

const router = express.Router();

const profileUpdateSchema = Joi.object({
  bio: Joi.string().max(500).optional(),
  interests: Joi.array().items(Joi.string()).optional(),
  profile_picture: Joi.string().uri().optional(),
});

// Authorization Function Call for all requests
router.use(protect);

//  Search Users
router.get('/search', searchUsers);

//  Get Specific User
router.get('/:id', getUserById);

//  Update User
router.route('/me').patch(updateUser).get(getMe).delete(deactivateUser);

// Route to handle profile photo uploads
router.patch(
  '/photo',
  ensureUploadsFolder,
  upload.single('profile_picture'),
  uploadProfilePhoto
);

//  Get Specific User Field
router.get('/me/:field', getUserField);

//  Update Password
router.patch('/me/password', updatePassword);

//  Update User Profile Information
router.patch('/me/profile', validate(profileUpdateSchema), updateUserProfile);

export default router;
