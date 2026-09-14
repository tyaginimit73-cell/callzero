import env from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const notFound = (req, res) =>
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}`, code: 'NOT_FOUND' });

export const errorHandler = (err, req, res, next) => {
  // Mongoose duplicate key
  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `${field} already in use`,
      code: 'DUPLICATE',
    });
  }

  // Mongoose validation
  if (err?.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(422).json({ success: false, message: messages[0], code: 'VALIDATION_ERROR' });
  }

  // CastError (invalid ObjectId)
  if (err?.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid identifier', code: 'BAD_REQUEST' });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      details: err.details,
    });
  }

  // JWT errors
  if (err?.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token', code: 'UNAUTHORIZED' });
  }
  if (err?.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Session expired, please log in again', code: 'UNAUTHORIZED' });
  }

  console.error('[error]', err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    code: 'INTERNAL',
    ...(env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
};
