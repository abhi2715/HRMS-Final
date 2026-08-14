/**
 * Application error hierarchy.
 *
 * All custom errors extend AppError so the global error handler can
 * distinguish expected operational errors from unexpected programming errors.
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;

    // Capture proper stack trace (excludes constructor call from stack)
    Error.captureStackTrace(this, this.constructor);
  }
}

// ── 400 Bad Request ────────────────────────────────────────
export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details?: Record<string, unknown>) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

// ── 400 Validation Error ───────────────────────────────────
export class ValidationError extends AppError {
  public readonly errors: Array<{ field: string; message: string }>;

  constructor(errors: Array<{ field: string; message: string }>) {
    super('Validation failed', 400, 'VALIDATION_ERROR', { errors });
    this.errors = errors;
  }
}

// ── 401 Authentication Error ───────────────────────────────
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

// ── 403 Authorization Error ────────────────────────────────
export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

// ── 404 Not Found ──────────────────────────────────────────
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

// ── 409 Conflict ───────────────────────────────────────────
export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}

// ── 429 Rate Limit ─────────────────────────────────────────
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

// ── 500 Internal Server Error ──────────────────────────────
export class InternalError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500, 'INTERNAL_ERROR');
    // We can't re-assign the readonly isOperational property directly like this in TS
    // if it was declared readonly and initialized in the super class.
    // Instead we bypass it using Object.defineProperty to override it just for this class
    Object.defineProperty(this, 'isOperational', {
      value: false,
      writable: false,
    });
  }
}
