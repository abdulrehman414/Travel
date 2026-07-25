import type { RequestHandler } from 'express';
import { ForbiddenError, UnauthorizedError } from '../lib/api-error';

/** Requires the principal to hold at least one of the given role slugs. */
export const requireRoles =
  (...roles: string[]): RequestHandler =>
  (req, _res, next) => {
    const user = req.user;
    if (!user) return next(new UnauthorizedError());
    if (!roles.some((role) => user.roles.includes(role))) {
      return next(new ForbiddenError());
    }
    next();
  };

/** Requires the principal to hold every one of the given permission keys. */
export const requirePermissions =
  (...permissions: string[]): RequestHandler =>
  (req, _res, next) => {
    const user = req.user;
    if (!user) return next(new UnauthorizedError());
    const owned = new Set(user.permissions);
    if (!permissions.every((permission) => owned.has(permission))) {
      return next(new ForbiddenError());
    }
    next();
  };
