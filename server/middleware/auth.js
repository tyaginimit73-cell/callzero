import { verifyToken } from '../utils/jwt.js';
import { UnauthorizedError, ForbiddenError } from '../utils/ApiError.js';
import User from '../models/User.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Authenticates the request via the HTTP-only cookie token (or optional Bearer
 * fallback for API clients / tests). Attaches req.user.
 */
export const protect = catchAsync(async (req, res, next) => {
  let token = req.cookies?.callzero_token;

  if (!token) {
    const auth = req.headers.authorization || '';
    if (auth.startsWith('Bearer ')) token = auth.slice(7);
  }

  if (!token) throw new UnauthorizedError('Please log in to continue');

  const payload = verifyToken(token); // throws on invalid/expired
  const user = await User.findById(payload.id);
  if (!user) throw new UnauthorizedError('Account no longer exists');

  if (user.isSuspended) {
    throw new ForbiddenError('Your account has been suspended');
  }

  req.user = user;
  next();
});

/** Restricts a route to admin users only. Must run after protect. */
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    throw new ForbiddenError('Admin access required');
  }
  next();
};
