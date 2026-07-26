import type { CookieOptions, Response } from 'express';
import { env, isProd } from '../../config/env';
import { refreshTokenTtlSeconds } from '../../lib/jwt';

export const REFRESH_COOKIE_NAME = 'slt_refresh_token';

/** Cookie is scoped to the auth routes so it is only sent where it is needed. */
const REFRESH_COOKIE_PATH = '/api/v1/auth';

function baseOptions(): CookieOptions {
  // In production the web app and API live on different origins (e.g. two Vercel
  // domains), so the refresh cookie must be `SameSite=None; Secure` or the browser
  // withholds it on the web app's cross-site calls to /auth/refresh. Locally
  // (same-site) we keep the stricter `SameSite=strict`. Because `secure` and the
  // cross-site trigger share the same condition, `None` is never emitted without
  // `Secure` (which browsers reject).
  const secure = env.COOKIE_SECURE || isProd;
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'strict',
    // A mismatched explicit Domain silently invalidates the cookie. Only pin a
    // real (non-localhost) domain; otherwise default to the response host so the
    // cookie is scoped to whichever domain the API is served from.
    domain: env.COOKIE_DOMAIN && env.COOKIE_DOMAIN !== 'localhost' ? env.COOKIE_DOMAIN : undefined,
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
