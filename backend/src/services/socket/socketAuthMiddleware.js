import jwt from 'jsonwebtoken';
import User from '../../models/user/UserSchema.js';

const socketAuthMiddleware = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token || socket.handshake.headers?.authorization;

    if (!token) {
      return next(new Error('Authentication token is required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user; // Attach user object to socket instance
    next();
  } catch (err) {
    console.error('❌ Socket Authentication Error:', err.message);
    next(new Error('Authentication failed'));
  }
};

export default socketAuthMiddleware;
