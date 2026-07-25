import { z } from 'zod';
import { paginationQuerySchema } from './common';
import { localeSchema, userStatusSchema, type UserStatus } from './enums';

// --------------------------------------------------------------- inputs -----

export const updateUserSchema = z.object({
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  phone: z.string().trim().min(3).max(32).optional(),
  status: userStatusSchema.optional(),
  locale: localeSchema.optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const setUserRolesSchema = z.object({
  roles: z.array(z.string().trim().min(1)),
});
export type SetUserRolesInput = z.infer<typeof setUserRolesSchema>;

export const userQuerySchema = paginationQuerySchema.extend({
  status: userStatusSchema.optional(),
  role: z.string().trim().optional(),
});
export type UserQuery = z.infer<typeof userQuerySchema>;

// -------------------------------------------------------------- outputs -----

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  status: UserStatus;
  emailVerified: boolean;
  locale: string;
  roles: string[];
  createdAt: string;
  lastLoginAt: string | null;
}
