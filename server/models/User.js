import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9_]{3,20}$/, 'Username must be 3-20 chars (a-z, 0-9, _)'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'away', 'busy'],
      default: 'offline',
    },
    lastSeen: {
      type: Date,
      default: null,
    },
    contacts: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        nickname: { type: String, default: '' },
        favorite: { type: Boolean, default: false },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'business'],
      default: 'free',
    },
  },
  { timestamps: true }
);

// Indexes for performance
userSchema.index({ name: 'text', username: 'text' });

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
