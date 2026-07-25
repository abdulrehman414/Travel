import type {
  CreateRoleInput,
  PermissionDto,
  RoleDto,
  SetRolePermissionsInput,
  UpdateRoleInput,
} from '@travel/types';
import { rbacRepository, type RoleRow } from './rbac.repository';
import { BadRequestError, ConflictError, NotFoundError } from '../../lib/api-error';

function toRoleDto(row: RoleRow): RoleDto {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    isSystem: row.isSystem,
    permissions: row.permissions.map((rp) => rp.permission.key),
    userCount: row._count.users,
    createdAt: row.createdAt.toISOString(),
  };
}

function isUniqueError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002'
  );
}

export const rbacService = {
  async listRoles(): Promise<RoleDto[]> {
    return (await rbacRepository.listRoles()).map(toRoleDto);
  },

  async getRole(id: string): Promise<RoleDto> {
    const row = await rbacRepository.findRole(id);
    if (!row) throw new NotFoundError('Role not found');
    return toRoleDto(row);
  },

  async createRole(input: CreateRoleInput): Promise<RoleDto> {
    try {
      return toRoleDto(await rbacRepository.createRole(input));
    } catch (error) {
      if (isUniqueError(error)) throw new ConflictError('A role with this name or slug already exists');
      throw error;
    }
  },

  async updateRole(id: string, input: UpdateRoleInput): Promise<RoleDto> {
    const existing = await rbacRepository.findRole(id);
    if (!existing) throw new NotFoundError('Role not found');
    return toRoleDto(await rbacRepository.updateRole(id, input));
  },

  async setPermissions(id: string, input: SetRolePermissionsInput): Promise<RoleDto> {
    const existing = await rbacRepository.findRole(id);
    if (!existing) throw new NotFoundError('Role not found');
    return toRoleDto(await rbacRepository.setRolePermissions(id, input.permissionKeys));
  },

  async deleteRole(id: string): Promise<void> {
    const existing = await rbacRepository.findRole(id);
    if (!existing) throw new NotFoundError('Role not found');
    if (existing.isSystem) throw new BadRequestError('System roles cannot be deleted');
    if (existing._count.users > 0) {
      throw new BadRequestError('Cannot delete a role that is still assigned to users');
    }
    await rbacRepository.deleteRole(id);
  },

  async listPermissions(): Promise<PermissionDto[]> {
    const permissions = await rbacRepository.listPermissions();
    return permissions.map((permission) => ({
      id: permission.id,
      key: permission.key,
      group: permission.group,
      description: permission.description,
    }));
  },
};
