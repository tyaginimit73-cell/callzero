import Call from '../models/Call.js';
import { catchAsync, success } from '../utils/catchAsync.js';
import { NotFoundError } from '../utils/ApiError.js';

export const getCallHistory = catchAsync(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 30, 100);
  const skip = (page - 1) * limit;

  const filter = { $or: [{ caller: req.user._id }, { receiver: req.user._id }] };
  if (req.query.type) filter.type = req.query.type;

  const total = await Call.countDocuments(filter);
  const calls = await Call.find(filter)
    .populate('caller', 'name username avatar')
    .populate('receiver', 'name username avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const result = calls.map((c) => {
    const isCaller = String(c.caller._id) === String(req.user._id);
    return {
      ...c,
      direction: isCaller ? 'outgoing' : 'incoming',
      peer: isCaller ? c.receiver : c.caller,
      missed: c.status === 'missed',
    };
  });

  return success(res, { calls: result, total, page, limit });
});

export const getCallById = catchAsync(async (req, res) => {
  const call = await Call.findById(req.params.id)
    .populate('caller', 'name username avatar')
    .populate('receiver', 'name username avatar');
  if (!call) throw new NotFoundError('Call not found');
  return success(res, { call });
});

export const createCallRecord = catchAsync(async (req, res) => {
  const call = await Call.create({ ...req.body, caller: req.user._id });
  return success(res, { call }, 'Call started', 201);
});
