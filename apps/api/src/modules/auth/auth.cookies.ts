import type { CookieOptions, Response } from 'express';
import { env, isProd } from '../../config/env';
import { refreshTokenTtlSeconds } from '../../lib/jwt';

export const REFRESH_COOKIE_NAME = 'slt_refresh_token';

/** Cookie is scoped to the auth routes so it is only sent where it is needed. */
const REFRESH_COOKIE_PATH = '/api/v1/auth';

function baseOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE || isProd,
    sameSite: 'strict',
    domain: env.COOKIE_DOMAIN,
    path: REFRESH_COOKIE_PATH,
  };
}

export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...baseOptions(),
    maxAge: refreshTokenTtlSeconds() * 1000,
  });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, baseOptions());
}
