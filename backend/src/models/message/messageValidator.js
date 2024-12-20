// validators/messageValidator.js
import Joi from 'joi';

export const createMessageSchema = Joi.object({
  senderId: Joi.string().hex().length(24).required(),
  content: Joi.string().required(),
  attachments: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('document', 'file', 'poll', 'thread'),
      resource: Joi.string().uri(),
      thread: Joi.string().hex().length(24),
    })
  ),
});

export const updateMessageSchema = Joi.object({
  content: Joi.string(),
  attachments: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('document', 'file', 'poll', 'thread'),
      resource: Joi.string().uri(),
      thread: Joi.string().hex().length(24),
    })
  ),
});
