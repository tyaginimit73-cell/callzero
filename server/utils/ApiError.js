/**
 * Standard API error used across the backend.
 * Results in: { success: false, message, code }
 */
export class ApiError extends Error {
  constructor(statusCode, message, code = 'API_ERROR', details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, message, 'NOT_FOUND');
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', details) {
    super(422, message, 'VALIDATION_ERROR', details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'You do not have permission') {
    super(403, message, 'FORBIDDEN');
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Resource already exists') {
    super(409, message, 'CONFLICT');
  }
}
