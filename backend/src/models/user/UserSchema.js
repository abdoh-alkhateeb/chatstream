import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    profile: {
      bio: { type: String },
      interests: { type: [String] },
      profile_picture: { type: String }, // URL to profile picture
    },
    friends: [
      {
        friend: { type: Schema.Types.ObjectId, ref: 'Users' },
        dm: [{ type: Schema.Types.ObjectId, ref: 'Rooms' }],
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },
    addresses: [
      {
        street: { type: String },
        city: { type: String },
        country: { type: String },
      },
    ],
    mfa_settings: {
      enabled: { type: Boolean, default: false },
      methods: { type: [String] }, // ['email', 'sms', 'authenticator_app']
    },
  },
  {
    timestamps: true,
  }
);

// 🛡️ Pre-save hook to hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.isNew) return next();
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// 🔐 Method to validate password
UserSchema.methods.isValidPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// 🛡️ Indexes
UserSchema.index({ email: 1 }, { unique: true, name: 'email_index' });

const User = model('Users', UserSchema);

export default User;
