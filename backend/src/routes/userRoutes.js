import express from 'express';
import {
  updateUser,
  getUserField,
  getUserById,
  searchUsers,
  updatePassword,
  deactivateUser,
  updateUserProfile,
} from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import Joi from 'joi';
import validate from '../middlewares/validateMiddleware.js';

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

//  Update User
router.route('/:id').patch(updateUser).get(getUserById).delete(deactivateUser);

//  Get Specific User Field
router.get('/:id/:field', getUserField);

//  Update Password
router.patch('/:id/password', updatePassword);

//  Update User Profile Information
router.patch('/:id/profile', validate(profileUpdateSchema), updateUserProfile);

export default router;
