import { prisma, type Prisma } from '@travel/db';
import type { Tag } from '@travel/db';
import type { TagQuery } from '@travel/types';

export type TagRow = Tag;

const SORT_FIELDS: Record<string, keyof Prisma.TagOrderByWithRelationInput> = {
  name: 'nameEn',
  slug: 'slug',
  createdAt: 'createdAt',
};

function buildWhere(query: TagQuery): Prisma.TagWhereInput {
  const where: Prisma.TagWhereInput = {};
  if (query.search) {
    where.OR = [
      { nameEn: { contains: query.search, mode: 'insensitive' } },
      { nameAr: { contains: query.search } },
      { slug: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  return where;
}

export const tagRepository = {
  async list(query: TagQuery): Promise<{ rows: TagRow[]; total: number }> {
    const where = buildWhere(query);
    const sortField = SORT_FIELDS[query.sort ?? ''] ?? 'createdAt';
    const orderBy: Prisma.TagOrderByWithRelationInput = { [sortField]: query.order };
    const skip = (query.page - 1) * query.limit;

    const [rows, total] = await prisma.$transaction([
      prisma.tag.findMany({ where, orderBy, skip, take: query.limit }),
      prisma.tag.count({ where }),
    ]);
    return { rows, total };
  },

  findBySlug(slug: string): Promise<TagRow | null> {
    return prisma.tag.findUnique({ where: { slug } });
  },

  findById(id: string): Promise<TagRow | null> {
    return prisma.tag.findUnique({ where: { id } });
  },

  create(data: Prisma.TagUncheckedCreateInput): Promise<TagRow> {
    return prisma.tag.create({ data });
  },

  update(id: string, data: Prisma.TagUncheckedUpdateInput): Promise<TagRow> {
    return prisma.tag.update({ where: { id }, data });
  },

  delete(id: string): Promise<unknown> {
    return prisma.tag.delete({ where: { id } });
  },
};
