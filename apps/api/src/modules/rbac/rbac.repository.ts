import { prisma, type Prisma } from '@travel/db';

const roleInclude = {
  permissions: { include: { permission: true } },
  _count: { select: { users: true } },
} satisfies Prisma.RoleInclude;

export type RoleRow = Prisma.RoleGetPayload<{ include: typeof roleInclude }>;

export const rbacRepository = {
  listRoles(): Promise<RoleRow[]> {
    return prisma.role.findMany({ include: roleInclude, orderBy: { createdAt: 'asc' } });
  },

  findRole(id: string): Promise<RoleRow | null> {
    return prisma.role.findUnique({ where: { id }, include: roleInclude });
  },

  createRole(data: Prisma.RoleUncheckedCreateInput): Promise<RoleRow> {
    return prisma.role.create({ data, include: roleInclude });
  },

  updateRole(id: string, data: Prisma.RoleUncheckedUpdateInput): Promise<RoleRow> {
    return prisma.role.update({ where: { id }, data, include: roleInclude });
  },

  deleteRole(id: string): Promise<unknown> {
    return prisma.role.delete({ where: { id } });
  },

  listPermissions() {
    return prisma.permission.findMany({ orderBy: [{ group: 'asc' }, { key: 'asc' }] });
  },

  async setRolePermissions(roleId: string, permissionKeys: string[]): Promise<RoleRow> {
    const permissions = await prisma.permission.findMany({
      where: { key: { in: permissionKeys } },
      select: { id: true },
    });
    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { roleId } }),
      prisma.rolePermission.createMany({
        data: permissions.map((permission) => ({ roleId, permissionId: permission.id })),
        skipDuplicates: true,
      }),
    ]);
    const role = await prisma.role.findUnique({ where: { id: roleId }, include: roleInclude });
    if (!role) throw new Error('Role vanished during permission update');
    return role;
  },
};
