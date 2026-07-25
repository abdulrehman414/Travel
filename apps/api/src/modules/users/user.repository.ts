import { prisma, type Prisma } from '@travel/db';
import type { UserQuery } from '@travel/types';

const rolesInclude = {
  roles: { include: { role: { select: { slug: true } } } },
} satisfies Prisma.UserInclude;

export type UserRow = Prisma.UserGetPayload<{ include: typeof rolesInclude }>;

const SORT_FIELDS: Record<string, keyof Prisma.UserOrderByWithRelationInput> = {
  email: 'email',
  firstName: 'firstName',
  lastName: 'lastName',
  status: 'status',
  createdAt: 'createdAt',
  lastLoginAt: 'lastLoginAt',
};

function buildWhere(query: UserQuery): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = { deletedAt: null };

  if (query.status) where.status = query.status;
  if (query.role) where.roles = { some: { role: { slug: query.role } } };

  if (query.search) {
    where.OR = [
      { email: { contains: query.search, mode: 'insensitive' } },
      { firstName: { contains: query.search, mode: 'insensitive' } },
      { lastName: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  return where;
}

export const userRepository = {
  async list(query: UserQuery): Promise<{ rows: UserRow[]; total: number }> {
    const where = buildWhere(query);
    const sortField = SORT_FIELDS[query.sort ?? ''] ?? 'createdAt';
    const orderBy: Prisma.UserOrderByWithRelationInput = { [sortField]: query.order };
    const skip = (query.page - 1) * query.limit;

    const [rows, total] = await prisma.$transaction([
      prisma.user.findMany({ where, include: rolesInclude, orderBy, skip, take: query.limit }),
      prisma.user.count({ where }),
    ]);
    return { rows, total };
  },

  findById(id: string): Promise<UserRow | null> {
    return prisma.user.findFirst({ where: { id, deletedAt: null }, include: rolesInclude });
  },

  update(id: string, data: Prisma.UserUncheckedUpdateInput): Promise<UserRow> {
    return prisma.user.update({ where: { id }, data, include: rolesInclude });
  },

  softDelete(id: string): Promise<unknown> {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });
  },

  findRolesBySlugs(slugs: string[]): Promise<{ id: string; slug: string }[]> {
    return prisma.role.findMany({
      where: { slug: { in: slugs } },
      select: { id: true, slug: true },
    });
  },

  replaceRoles(id: string, roleIds: string[]): Promise<UserRow | null> {
    return prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId: id } });
      if (roleIds.length) {
        await tx.userRole.createMany({
          data: roleIds.map((roleId) => ({ userId: id, roleId })),
        });
      }
      return tx.user.findFirst({ where: { id }, include: rolesInclude });
    });
  },
};
