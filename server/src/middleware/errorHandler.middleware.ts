import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '../utils/errors';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';
import { env } from '../config/env';

/**
 * Global error handler.
 *
 * Catches all errors that pass through the middleware chain and returns
 * a standardized error response. Distinguishes between operational errors
 * (AppError subclasses) and unexpected programming errors.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // ── Operational errors (our custom error classes) ──────────
  if (err instanceof ValidationError) {
    sendError(res, err.message, err.statusCode, err.code, err.errors);
    return;
  }

  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error('Non-operational error:', err);
    }
    sendError(res, err.message, err.statusCode, err.code, err.details);
    return;
  }

  // ── Zod validation errors ─────────────────────────────────
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR', formattedErrors);
    return;
  }

  // ── Mongoose validation errors ────────────────────────────
  if (err instanceof mongoose.Error.ValidationError) {
    const formattedErrors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR', formattedErrors);
    return;
  }

  // ── Mongoose cast errors (invalid ObjectId, etc.) ─────────
  if (err instanceof mongoose.Error.CastError) {
    sendError(res, `Invalid ${err.path}: ${err.value}`, 400, 'CAST_ERROR');
    return;
  }

  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const keyValue = (err as any).keyValue;
    const field = Object.keys(keyValue || {})[0] || 'field';
    sendError(res, `Duplicate value for ${field}`, 409, 'CONFLICT');
    return;
  }

  // ── JWT errors ────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token', 401, 'INVALID_TOKEN');
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token expired', 401, 'TOKEN_EXPIRED');
    return;
  }

  // ── Unexpected errors ─────────────────────────────────────
  logger.error('Unexpected error:', err);

  const message = env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : err.message || 'Internal server error';

  sendError(res, message, 500, 'INTERNAL_ERROR');
};
