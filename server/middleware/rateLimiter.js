import rateLimit from 'express-rate-limit';
import env from '../config/env.js';

const defaultOptions = {
  windowMs: env.RATE_LIMIT_WINDOW,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please slow down',
    code: 'RATE_LIMITED',
  },
};

export const apiLimiter = rateLimit(defaultOptions);

export const authLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 15 * 60 * 1000,
  max: 20, // stricter for auth endpoints
  message: { success: false, message: 'Too many auth attempts, please try later', code: 'RATE_LIMITED' },
});
