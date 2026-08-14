import { Response } from 'express';

/**
 * Standardized API response utilities.
 *
 * Every API response follows this shape:
 * {
 *   success: boolean;
 *   message: string;
 *   data?: T;
 *   meta?: PaginationMeta;
 *   error?: ErrorDetail;
 * }
 */

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface ErrorDetail {
  code: string;
  details?: unknown;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  error?: ErrorDetail;
}

// ── Success Responses ────────────────────────────────────────

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(statusCode).json(response);
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message = 'Resource created successfully'
): void => {
  sendSuccess(res, data, message, 201);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  meta: PaginationMeta,
  message = 'Success'
): void => {
  const response: ApiResponse<T[]> = {
    success: true,
    message,
    data,
    meta,
  };

  // Set pagination headers for convenience
  res.setHeader('X-Total-Count', meta.total.toString());
  res.setHeader('X-Page', meta.page.toString());
  res.setHeader('X-Per-Page', meta.perPage.toString());

  res.status(200).json(response);
};

export const sendNoContent = (res: Response): void => {
  res.status(204).end();
};

// ── Error Responses ──────────────────────────────────────────

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  code = 'INTERNAL_ERROR',
  details?: unknown
): void => {
  const response: ApiResponse = {
    success: false,
    message,
    error: {
      code,
      ...(details !== undefined && { details }),
    },
  };
  res.status(statusCode).json(response);
};
