import Message from '../models/message/MessageSchema.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
// TODO: Test editMessage and deleteMessage controllers

// 📝 Edit a Message
export const editMessage = catchAsync(async (req, res, next) => {
  const { content } = req.body;
  const message = await Message.findById(req.params.messageId);

  if (!message) {
    return next(new AppError('Message not found', 404));
  }

  if (message.senderId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only edit your own messages', 403));
  }

  if (!content) {
    return next(new AppError('Message content is required', 400));
  }

  message.content = content;
  await message.save();

  res.status(200).json({ status: 'success', data: message });
});

// 🗑️ Delete a Message
export const deleteMessage = catchAsync(async (req, res, next) => {
  const message = await Message.findById(req.params.messageId);

  if (!message) {
    return next(new AppError('Message not found', 404));
  }

  if (message.senderId.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only delete your own messages', 403));
  }

  await message.deleteOne();

  res.status(204).send();
});
