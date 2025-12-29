class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/* ------------------------------ Basic errors ------------------------------ */
class DomainValidationError extends AppError {
  constructor(message = 'Invalid domain access') {
    super(message, 403); // Forbidden
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409); // Conflict
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, 404); // Not Found
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Not authorized') {
    super(message, 401);
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
  }
}

/* ------------------------- Domain specific errors ------------------------- */

module.exports = {
  DomainValidationError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  RateLimitError,
};
