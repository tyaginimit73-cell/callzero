import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { catchAsync, success } from '../utils/catchAsync.js';
import { signToken, setAuthCookie, clearAuthCookie } from '../utils/jwt.js';
import { ConflictError, UnauthorizedError } from '../utils/ApiError.js';

export const register = catchAsync(async (req, res) => {
  const { name, username, email, password } = req.body;

  const existing = await User.findOne({
    $or: [{ email }, { username }],
  }).lean();
  if (existing) {
    throw new ConflictError(existing.email === email ? 'Email already registered' : 'Username already taken');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, username, email, passwordHash });

  const token = signToken({ id: user._id });
  setAuthCookie(res, token);

  return success(res, { user: user.toSafeObject(), token }, 'Account created', 201);
});

export const login = catchAsync(async (req, res) => {
  const { identifier, password } = req.body;

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier.toLowerCase() }],
  }).select('+passwordHash');

  if (!user || !(await user.comparePassword(password))) {
    throw new UnauthorizedError('Invalid email/username or password');
  }

  if (user.isSuspended) {
    throw new UnauthorizedError('Your account has been suspended');
  }

  user.status = 'online';
  user.lastSeen = new Date();
  await user.save();

  const token = signToken({ id: user._id });
  setAuthCookie(res, token);

  return success(res, { user: user.toSafeObject(), token }, 'Logged in');
});

export const logout = catchAsync(async (req, res) => {
  if (req.user) {
    req.user.status = 'offline';
    req.user.lastSeen = new Date();
    await req.user.save();
  }
  clearAuthCookie(res);
  return success(res, null, 'Logged out');
});

export const me = catchAsync(async (req, res) => {
  return success(res, { user: req.user.toSafeObject() });
});
