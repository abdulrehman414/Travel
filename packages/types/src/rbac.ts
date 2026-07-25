import { z } from 'zod';

const slugField = z
  .string()
  .min(2)
  .max(60)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug');

export const createRoleSchema = z.object({
  name: z.string().trim().min(2).max(60),
  slug: slugField,
  description: z.string().max(200).optional(),
});
export type CreateRoleInput = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  description: z.string().max(200).optional(),
});
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

export const setRolePermissionsSchema = z.object({
  permissionKeys: z.array(z.string()).default([]),
});
export type SetRolePermissionsInput = z.infer<typeof setRolePermissionsSchema>;

export interface RoleDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
  userCount: number;
  createdAt: string;
}

export interface PermissionDto {
  id: string;
  key: string;
  group: string;
  description: string | null;
}
