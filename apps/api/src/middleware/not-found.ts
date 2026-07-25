import type { RequestHandler } from 'express';
import { NotFoundError } from '../lib/api-error';

export const notFound: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
};
