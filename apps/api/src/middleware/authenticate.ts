import type { RequestHandler } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import { UnauthorizedError } from '../lib/api-error';

const BEARER = 'Bearer ';

/** Requires a valid Bearer access token; attaches the principal to req.user. */
export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith(BEARER)) {
    return next(new UnauthorizedError('Authentication required'));
  }
  try {
    const payload = verifyAccessToken(header.slice(BEARER.length).trim());
    req.user = {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles ?? [],
      permissions: payload.permissions ?? [],
    };
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};

/** Attaches req.user when a valid token is present, but never rejects. */
export const optionalAuthenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (header?.startsWith(BEARER)) {
    try {
      const payload = verifyAccessToken(header.slice(BEARER.length).trim());
      req.user = {
        id: payload.sub,
        email: payload.email,
        roles: payload.roles ?? [],
        permissions: payload.permissions ?? [],
      };
    } catch {
      /* ignore — anonymous request */
    }
  }
  next();
};
