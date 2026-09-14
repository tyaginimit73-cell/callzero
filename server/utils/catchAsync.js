/**
 * Wraps async route handlers so thrown errors flow to the central error middleware.
 */
export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const success = (res, data = null, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, data });
