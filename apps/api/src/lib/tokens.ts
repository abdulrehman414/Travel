import { createHash, randomBytes } from 'node:crypto';

/** Cryptographically-random opaque token (used for refresh & reset tokens). */
export function generateOpaqueToken(bytes = 48): string {
  return randomBytes(bytes).toString('base64url');
}

/** One-way hash for tokens at rest, so a DB leak never exposes usable tokens. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
