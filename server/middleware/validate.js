import { ValidationError } from '../utils/ApiError.js';

/**
 * Validates req.body against a Zod schema.
 * Usage: validate(registerSchema)
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    throw new ValidationError('Validation failed', details);
  }
  req.body = result.data;
  next();
};
