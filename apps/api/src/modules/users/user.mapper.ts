import type { UserDto } from '@travel/types';
import type { UserRow } from './user.repository';

const iso = (value: Date | null): string | null => (value ? value.toISOString() : null);

export function toUser(row: UserRow): UserDto {
  return {
    id: row.id,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    phone: row.phone,
    avatarUrl: row.avatarUrl,
    status: row.status,
    emailVerified: row.emailVerified,
    locale: row.locale,
    roles: row.roles.map((userRole) => userRole.role.slug),
    createdAt: row.createdAt.toISOString(),
    lastLoginAt: iso(row.lastLoginAt),
  };
}
