import User from '../models/User.js';
import { catchAsync, success } from '../utils/catchAsync.js';
import { NotFoundError, ForbiddenError } from '../utils/ApiError.js';

export const searchUsers = catchAsync(async (req, res) => {
  const q = (req.query.q || '').trim();
  const limit = Math.min(Number(req.query.limit) || 20, 50);

  const filter = { _id: { $ne: req.user._id }, isSuspended: false };
  if (q) filter.$or = [
    { name: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
    { username: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
  ];

  const users = await User.find(filter)
    .select('name username avatar status lastSeen')
    .limit(limit)
    .lean();

  const blockedBy = new Set((req.user.blockedUsers || []).map(String));
  const result = users
    .filter((u) => !blockedBy.has(String(u._id)))
    .map((u) => ({
      ...u,
      isContact: (req.user.contacts || []).some((c) => String(c.user) === String(u._id)),
    }));

  return success(res, { users: result });
});

export const getUserById = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('name username avatar status lastSeen')
    .lean();
  if (!user) throw new NotFoundError('User not found');
  return success(res, { user });
});

export const updateProfile = catchAsync(async (req, res) => {
  const updatable = ['name', 'avatar', 'status'];
  updatable.forEach((k) => {
    if (req.body[k] !== undefined) req.user[k] = req.body[k];
  });
  await req.user.save();
  return success(res, { user: req.user.toSafeObject() }, 'Profile updated');
});

export const blockUser = catchAsync(async (req, res) => {
  const target = await User.findById(req.params.id);
  if (!target) throw new NotFoundError('User not found');
  if (String(target._id) === String(req.user._id)) throw new ForbiddenError('You cannot block yourself');

  if (!req.user.blockedUsers.includes(target._id)) {
    req.user.blockedUsers.push(target._id);
    await req.user.save();
  }
  return success(res, { blocked: true }, 'User blocked');
});

export const unblockUser = catchAsync(async (req, res) => {
  req.user.blockedUsers = req.user.blockedUsers.filter((id) => String(id) !== String(req.params.id));
  await req.user.save();
  return success(res, { blocked: false }, 'User unblocked');
});
