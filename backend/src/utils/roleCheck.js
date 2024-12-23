import AppError from './appError.js';

// 🛡️ Ensure the logged-in user is the same as the requested user
const ensureOwnership = (userId, loggedInUserId, next) => {
  if (userId.toString() !== loggedInUserId.toString()) {
    return next(
      new AppError('You are not authorized to perform this action', 403)
    );
  }
};

export default ensureOwnership;
