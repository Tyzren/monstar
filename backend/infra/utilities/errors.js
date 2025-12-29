class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/* ------------------------------ Basic errors ------------------------------ */
class Error403Forbidden extends AppError {
  constructor(message = 'Invalid domain access') {
    super(message, 403); // Forbidden
  }
}

class Error409Conflict extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409); // Conflict
  }
}

class Error404NotFound extends AppError {
  constructor(message = 'Not found') {
    super(message, 404); // Not Found
  }
}

class Error422Unprocessable extends AppError {
  constructor(message = 'Not found') {
    super(message, 404); // Not Found
  }
}

class Error401NotAuthorized extends AppError {
  constructor(message = 'Not authorized') {
    super(message, 401);
  }
}

class Error429RateLimited extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
  }
}

/* ------------------------- Domain specific errors ------------------------- */

module.exports = {
  Error403Forbidden,
  Error409Conflict,
  Error404NotFound,
  Error401NotAuthorized,
  Error422Unprocessable,
  Error429RateLimited,
};
