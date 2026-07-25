import { prisma, type Prisma } from '@travel/db';
import type { CategoryQuery } from '@travel/types';

const refSelect = { id: true, kind: true, slug: true, nameEn: true, nameAr: true } as const;

const categoryInclude = {
  parent: { select: refSelect },
  _count: { select: { children: true } },
} satisfies Prisma.CategoryInclude;

export type CategoryRow = Prisma.CategoryGetPayload<{ include: typeof categoryInclude }>;

const SORT_FIELDS: Record<string, keyof Prisma.CategoryOrderByWithRelationInput> = {
  order: 'order',
  name: 'nameEn',
  createdAt: 'createdAt',
};

function buildWhere(query: CategoryQuery): Prisma.CategoryWhereInput {
  const where: Prisma.CategoryWhereInput = {};

  if (query.kind) where.kind = query.kind;
  if (query.parentId) where.parentId = query.parentId;
  if (query.search) {
    where.OR = [
      { nameEn: { contains: query.search, mode: 'insensitive' } },
      { nameAr: { contains: query.search } },
      { slug: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  return where;
}

export const categoryRepository = {
  async list(query: CategoryQuery): Promise<{ rows: CategoryRow[]; total: number }> {
    const where = buildWhere(query);
    const sortField = SORT_FIELDS[query.sort ?? ''] ?? 'order';
    const orderBy: Prisma.CategoryOrderByWithRelationInput = { [sortField]: query.order };
    const skip = (query.page - 1) * query.limit;

    const [rows, total] = await prisma.$transaction([
      prisma.category.findMany({ where, include: categoryInclude, orderBy, skip, take: query.limit }),
      prisma.category.count({ where }),
    ]);
    return { rows, total };
  },

  findById(id: string): Promise<CategoryRow | null> {
    return prisma.category.findUnique({ where: { id }, include: categoryInclude });
  },

  create(data: Prisma.CategoryUncheckedCreateInput): Promise<CategoryRow> {
    return prisma.category.create({ data, include: categoryInclude });
  },

  update(id: string, data: Prisma.CategoryUncheckedUpdateInput): Promise<CategoryRow> {
    return prisma.category.update({ where: { id }, data, include: categoryInclude });
  },

  delete(id: string): Promise<unknown> {
    return prisma.category.delete({ where: { id } });
  },
};
