import { prisma, type Prisma } from '@travel/db';

/** Include tree that loads a user's roles and their permissions. */
const userRolesInclude = {
  roles: {
    include: {
      role: { include: { permissions: { include: { permission: true } } } },
    },
  },
} satisfies Prisma.UserInclude;

export type UserWithRoles = Prisma.UserGetPayload<{ include: typeof userRolesInclude }>;

export interface CreateCustomerData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  locale: string;
}

export interface CreateRefreshTokenData {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

export const authRepository = {
  findByEmail(email: string): Promise<UserWithRoles | null> {
    return prisma.user.findUnique({ where: { email }, include: userRolesInclude });
  },

  findById(id: string): Promise<UserWithRoles | null> {
    return prisma.user.findUnique({ where: { id }, include: userRolesInclude });
  },

  async emailExists(email: string): Promise<boolean> {
    const count = await prisma.user.count({ where: { email } });
    return count > 0;
  },

  async createCustomer(data: CreateCustomerData): Promise<UserWithRoles> {
    const customerRole = await prisma.role.findUnique({ where: { slug: 'customer' } });
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        locale: data.locale,
        // Unverified until they confirm their email; login is still allowed,
        // the UI surfaces a "verify your email" state until emailVerified flips.
        status: 'PENDING',
        ...(customerRole ? { roles: { create: { roleId: customerRole.id } } } : {}),
      },
      include: userRolesInclude,
    });
  },

  updateLastLogin(id: string): Promise<unknown> {
    return prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } });
  },

  updatePassword(id: string, passwordHash: string): Promise<unknown> {
    return prisma.user.update({ where: { id }, data: { passwordHash } });
  },

  createRefreshToken(data: CreateRefreshTokenData): Promise<unknown> {
    return prisma.refreshToken.create({ data });
  },

  findRefreshToken(tokenHash: string) {
    return prisma.refreshToken.findUnique({ where: { tokenHash } });
  },

  revokeRefreshToken(tokenHash: string): Promise<unknown> {
    return prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  revokeAllRefreshTokens(userId: string): Promise<unknown> {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  createPasswordResetToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<unknown> {
    return prisma.passwordResetToken.create({ data });
  },

  findValidResetToken(tokenHash: string) {
    return prisma.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
    });
  },

  markResetTokenUsed(id: string): Promise<unknown> {
    return prisma.passwordResetToken.update({ where: { id }, data: { usedAt: new Date() } });
  },

  invalidateUserResetTokens(userId: string): Promise<unknown> {
    return prisma.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });
  },

  createVerificationToken(data: {
    userId: string;
    tokenHash: string;
    type: string;
    expiresAt: Date;
  }): Promise<unknown> {
    return prisma.verificationToken.create({ data });
  },

  findValidVerificationToken(tokenHash: string, type: string) {
    return prisma.verificationToken.findFirst({
      where: { tokenHash, type, usedAt: null, expiresAt: { gt: new Date() } },
    });
  },

  markVerificationTokenUsed(id: string): Promise<unknown> {
    return prisma.verificationToken.update({ where: { id }, data: { usedAt: new Date() } });
  },

  invalidateUserVerificationTokens(userId: string, type: string): Promise<unknown> {
    return prisma.verificationToken.updateMany({
      where: { userId, type, usedAt: null },
      data: { usedAt: new Date() },
    });
  },

  markEmailVerified(userId: string): Promise<UserWithRoles> {
    return prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true, status: 'ACTIVE' },
      include: userRolesInclude,
    });
  },

  findByGoogleId(googleId: string): Promise<UserWithRoles | null> {
    return prisma.user.findUnique({ where: { googleId }, include: userRolesInclude });
  },

  async createGoogleUser(data: {
    email: string;
    googleId: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    locale: string;
  }): Promise<UserWithRoles> {
    const customerRole = await prisma.role.findUnique({ where: { slug: 'customer' } });
    return prisma.user.create({
      data: {
        email: data.email,
        googleId: data.googleId,
        firstName: data.firstName,
        lastName: data.lastName,
        avatarUrl: data.avatarUrl,
        locale: data.locale,
        // Google has already verified the email, so the account is active.
        status: 'ACTIVE',
        emailVerified: true,
        ...(customerRole ? { roles: { create: { roleId: customerRole.id } } } : {}),
      },
      include: userRolesInclude,
    });
  },

  linkGoogleAccount(userId: string, googleId: string): Promise<UserWithRoles> {
    return prisma.user.update({
      where: { id: userId },
      data: { googleId, emailVerified: true },
      include: userRolesInclude,
    });
  },
};
