// validators/roomValidator.js
import Joi from 'joi';

export const createRoomSchema = Joi.object({
  type: Joi.string().valid('DM', 'GroupDM').required(),
  participants: Joi.array().items(Joi.string().hex().length(24)).required(),
  name: Joi.string().max(50),
  creator: Joi.string().hex().length(24),
  messages: Joi.array().items(Joi.string().hex().length(24)),
});

export const updateRoomSchema = Joi.object({
  type: Joi.string().valid('DM', 'GroupDM'),
  participants: Joi.array().items(Joi.string().hex().length(24)),
  name: Joi.string().max(50),
  creator: Joi.string().hex().length(24),
  messages: Joi.array().items(Joi.string().hex().length(24)),
});
