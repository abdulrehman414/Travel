import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';

/** Assigns a stable request id (honouring an inbound X-Request-Id) for tracing. */
export const requestContext: RequestHandler = (req, res, next) => {
  const inbound = req.headers['x-request-id'];
  req.id = typeof inbound === 'string' && inbound.length > 0 ? inbound : randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
};
