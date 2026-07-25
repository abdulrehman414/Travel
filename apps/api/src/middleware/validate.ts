import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodTypeAny } from 'zod';

export interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Validates and coerces request parts against Zod schemas. On failure the
 * ZodError is forwarded to the central error handler which maps it to a 422.
 * Parsed (and coerced) values replace the originals so controllers receive
 * fully-typed, trusted input.
 */
export const validate =
  (schemas: ValidationSchemas): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.query) {
        // Express 4 exposes req.query as a writable property.
        (req as unknown as { query: unknown }).query = schemas.query.parse(req.query);
      }
      if (schemas.body) req.body = schemas.body.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
