import Joi from 'joi';

export const createUserSchema = Joi.object({
  name: Joi.string().required().min(3).max(50),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
  profile: Joi.object({
    bio: Joi.string().max(500),
    interests: Joi.array().items(Joi.string().max(50)),
    profile_picture: Joi.string().uri(),
  }),
  confirmEmail: Joi.boolean(),
  otp: Joi.object({
    code: Joi.string(),
    expiresAt: Joi.date(),
  }),
  addresses: Joi.array().items(
    Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      country: Joi.string(),
    })
  ),
  mfa_settings: Joi.object({
    enabled: Joi.boolean(),
    methods: Joi.array().items(
      Joi.string().valid('email', 'sms', 'authenticator_app')
    ),
  }),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(3).max(50),
  email: Joi.string().email(),
  password: Joi.string().min(6),
  profile: Joi.object({
    bio: Joi.string().max(500),
    interests: Joi.array().items(Joi.string().max(50)),
    profile_picture: Joi.string().uri(),
  }),
  confirmEmail: Joi.boolean(),
  otp: Joi.object({
    code: Joi.string(),
    expiresAt: Joi.date(),
  }),
  addresses: Joi.array().items(
    Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      country: Joi.string(),
    })
  ),
  mfa_settings: Joi.object({
    enabled: Joi.boolean(),
    methods: Joi.array().items(
      Joi.string().valid('email', 'sms', 'authenticator_app')
    ),
  }),
});
