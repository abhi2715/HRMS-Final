import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

/**
 * Request validation middleware factory.
 *
 * Validates req.body, req.query, and/or req.params against Zod schemas.
 * Pass the schemas you need; omit the rest.
 *
 * Usage:
 *   router.post('/users', validate({ body: createUserSchema }), controller.create);
 */

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: Array<{ field: string; message: string }> = [];

    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
    } catch (err) {
      if (err instanceof ZodError) {
        errors.push(
          ...err.errors.map((e) => ({
            field: `body.${e.path.join('.')}`,
            message: e.message,
          }))
        );
      }
    }

    try {
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Record<string, string>;
      }
    } catch (err) {
      if (err instanceof ZodError) {
        errors.push(
          ...err.errors.map((e) => ({
            field: `query.${e.path.join('.')}`,
            message: e.message,
          }))
        );
      }
    }

    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Record<string, string>;
      }
    } catch (err) {
      if (err instanceof ZodError) {
        errors.push(
          ...err.errors.map((e) => ({
            field: `params.${e.path.join('.')}`,
            message: e.message,
          }))
        );
      }
    }

    if (errors.length > 0) {
      return next(new ValidationError(errors));
    }

    next();
  };
};
