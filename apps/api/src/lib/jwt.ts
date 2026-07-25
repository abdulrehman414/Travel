import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
}

const ISSUER = 'saudi-luxury-travel';

/** Parses durations like "15m", "7d", "3600" (bare = seconds) into seconds. */
export function parseDurationToSeconds(input: string): number {
  const match = /^(\d+)\s*(s|m|h|d)?$/i.exec(input.trim());
  if (!match) throw new Error(`Invalid duration format: "${input}"`);
  const value = Number(match[1]);
  const unit = (match[2] ?? 's').toLowerCase();
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return value * (multipliers[unit] ?? 1);
}

export const accessTokenTtlSeconds = (): number => parseDurationToSeconds(env.JWT_ACCESS_EXPIRES_IN);
export const refreshTokenTtlSeconds = (): number =>
  parseDurationToSeconds(env.JWT_REFRESH_EXPIRES_IN);

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: accessTokenTtlSeconds(),
    issuer: ISSUER,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, { issuer: ISSUER });
  if (typeof decoded === 'string') {
    throw new Error('Unexpected access-token payload');
  }
  return decoded as AccessTokenPayload;
}
