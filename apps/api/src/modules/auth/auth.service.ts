import type { AuthResult, AuthUser, LoginInput, RegisterInput } from '@travel/types';
import { authRepository, type UserWithRoles } from './auth.repository';
import { hashPassword, verifyPassword } from '../../lib/password';
import { accessTokenTtlSeconds, refreshTokenTtlSeconds, signAccessToken } from '../../lib/jwt';
import { generateOpaqueToken, hashToken } from '../../lib/tokens';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../../lib/api-error';
import { emailService } from '../../integrations/email';
import { env } from '../../config/env';

export interface RequestMeta {
  userAgent?: string;
  ipAddress?: string;
}

export interface SessionResult {
  result: AuthResult;
  refreshToken: string;
}

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
const EMAIL_VERIFICATION_TYPE = 'EMAIL_VERIFICATION';
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/** Issues a fresh single-use email-verification token and emails the link. */
async function issueEmailVerification(user: {
  id: string;
  email: string;
  firstName: string;
}): Promise<void> {
  await authRepository.invalidateUserVerificationTokens(user.id, EMAIL_VERIFICATION_TYPE);
  const token = generateOpaqueToken(32);
  await authRepository.createVerificationToken({
    userId: user.id,
    tokenHash: hashToken(token),
    type: EMAIL_VERIFICATION_TYPE,
    expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
  });
  const verifyUrl = `${env.WEB_APP_URL}/verify-email?token=${token}`;
  void emailService.sendVerification(user.email, { firstName: user.firstName, verifyUrl });
}

function toAuthUser(user: UserWithRoles): AuthUser {
  const roles = user.roles.map((userRole) => userRole.role.slug);
  const permissions = Array.from(
    new Set(
      user.roles.flatMap((userRole) =>
        userRole.role.permissions.map((rolePermission) => rolePermission.permission.key),
      ),
    ),
  );
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
    locale: user.locale,
    emailVerified: user.emailVerified,
    roles,
    permissions,
  };
}

async function issueSession(user: UserWithRoles, meta: RequestMeta): Promise<SessionResult> {
  const authUser = toAuthUser(user);
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    roles: authUser.roles,
    permissions: authUser.permissions,
  });

  const refreshToken = generateOpaqueToken();
  await authRepository.createRefreshToken({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + refreshTokenTtlSeconds() * 1000),
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
  });

  return {
    result: { user: authUser, tokens: { accessToken, expiresIn: accessTokenTtlSeconds() } },
    refreshToken,
  };
}

export const authService = {
  async register(input: RegisterInput, meta: RequestMeta): Promise<SessionResult> {
    if (await authRepository.emailExists(input.email)) {
      throw new ConflictError('An account with this email already exists');
    }
    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.createCustomer({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      locale: input.locale,
    });
    await issueEmailVerification(user);
    return issueSession(user, meta);
  },

  async verifyEmail(rawToken: string): Promise<AuthUser> {
    const stored = await authRepository.findValidVerificationToken(
      hashToken(rawToken),
      EMAIL_VERIFICATION_TYPE,
    );
    if (!stored) {
      throw new BadRequestError('This verification link is invalid or has expired');
    }
    const user = await authRepository.markEmailVerified(stored.userId);
    await authRepository.markVerificationTokenUsed(stored.id);
    void emailService.sendWelcome(user.email, { firstName: user.firstName });
    return toAuthUser(user);
  },

  async resendVerification(email: string): Promise<void> {
    const user = await authRepository.findByEmail(email);
    // Never reveal whether the account exists or is already verified.
    if (!user || user.emailVerified) return;
    await issueEmailVerification(user);
  },

  async loginWithGoogle(idToken: string, meta: RequestMeta): Promise<SessionResult> {
    if (!env.GOOGLE_CLIENT_ID) {
      throw new BadRequestError('Google sign-in is not configured');
    }
    // Validate the ID token with Google (checks signature/expiry server-side).
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    );
    if (!res.ok) {
      throw new UnauthorizedError('Google sign-in failed. Please try again.');
    }
    const info = (await res.json()) as {
      aud?: string;
      sub?: string;
      email?: string;
      email_verified?: string | boolean;
      given_name?: string;
      family_name?: string;
      name?: string;
      picture?: string;
    };
    const emailVerified = info.email_verified === true || info.email_verified === 'true';
    if (!info.sub || !info.email || info.aud !== env.GOOGLE_CLIENT_ID || !emailVerified) {
      throw new UnauthorizedError('Google sign-in failed. Please try again.');
    }

    const email = info.email.toLowerCase();
    const firstName = info.given_name ?? info.name ?? email.split('@')[0] ?? 'User';
    const lastName = info.family_name ?? '';

    // 1) known Google account → 2) same email (link) → 3) brand-new account.
    let user = await authRepository.findByGoogleId(info.sub);
    if (!user) {
      const existing = await authRepository.findByEmail(email);
      user = existing
        ? await authRepository.linkGoogleAccount(existing.id, info.sub)
        : await authRepository.createGoogleUser({
            email,
            googleId: info.sub,
            firstName,
            lastName,
            avatarUrl: info.picture,
            locale: 'en',
          });
    }
    await authRepository.updateLastLogin(user.id);
    return issueSession(user, meta);
  },

  async login(input: LoginInput, meta: RequestMeta): Promise<SessionResult> {
    const user = await authRepository.findByEmail(input.email);
    // A null passwordHash means the account was created via Google sign-in.
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid email or password');
    }
    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }
    if (user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      throw new UnauthorizedError('Your account is not active. Please contact support.');
    }
    await authRepository.updateLastLogin(user.id);
    return issueSession(user, meta);
  },

  async refresh(rawToken: string | undefined, meta: RequestMeta): Promise<SessionResult> {
    if (!rawToken) {
      throw new UnauthorizedError('Missing refresh token');
    }
    const tokenHash = hashToken(rawToken);
    const stored = await authRepository.findRefreshToken(tokenHash);
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired session');
    }
    const user = await authRepository.findById(stored.userId);
    if (!user) {
      throw new UnauthorizedError('Invalid session');
    }
    // Rotate: revoke the used token before issuing a new one.
    await authRepository.revokeRefreshToken(tokenHash);
    return issueSession(user, meta);
  },

  async logout(rawToken: string | undefined): Promise<void> {
    if (rawToken) {
      await authRepository.revokeRefreshToken(hashToken(rawToken));
    }
  },

  async forgotPassword(email: string): Promise<void> {
    const user = await authRepository.findByEmail(email);
    // Do not reveal whether the account exists.
    if (!user) return;

    await authRepository.invalidateUserResetTokens(user.id);
    const token = generateOpaqueToken(32);
    await authRepository.createPasswordResetToken({
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
    });

    const resetUrl = `${env.WEB_APP_URL}/reset-password?token=${token}`;
    void emailService.sendPasswordReset(user.email, { firstName: user.firstName, resetUrl });
  },

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const stored = await authRepository.findValidResetToken(hashToken(rawToken));
    if (!stored) {
      throw new BadRequestError('Invalid or expired reset token');
    }
    const passwordHash = await hashPassword(newPassword);
    await authRepository.updatePassword(stored.userId, passwordHash);
    await authRepository.markResetTokenUsed(stored.id);
    await authRepository.revokeAllRefreshTokens(stored.userId);
  },

  async changePassword(userId: string, current: string, next: string): Promise<void> {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    if (!user.passwordHash) {
      throw new BadRequestError(
        'This account signs in with Google. Use "Forgot password" to set a password first.',
      );
    }
    const valid = await verifyPassword(current, user.passwordHash);
    if (!valid) {
      throw new BadRequestError('Current password is incorrect');
    }
    const passwordHash = await hashPassword(next);
    await authRepository.updatePassword(userId, passwordHash);
    await authRepository.revokeAllRefreshTokens(userId);
  },

  async me(userId: string): Promise<AuthUser> {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return toAuthUser(user);
  },
};
