import { prisma, type Prisma } from '@travel/db';
import type { FaqQuery } from '@travel/types';

export type FaqRow = Prisma.FaqGetPayload<Record<string, never>>;

const SORT_FIELDS: Record<string, keyof Prisma.FaqOrderByWithRelationInput> = {
  order: 'order',
  category: 'category',
  createdAt: 'createdAt',
};

function buildWhere(query: FaqQuery, onlyPublished: boolean): Prisma.FaqWhereInput {
  const where: Prisma.FaqWhereInput = {};

  if (onlyPublished) where.published = true;
  else if (query.published !== undefined) where.published = query.published;

  if (query.category) where.category = query.category;

  if (query.search) {
    where.OR = [
      { questionEn: { contains: query.search, mode: 'insensitive' } },
      { questionAr: { contains: query.search } },
      { answerEn: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  return where;
}

function buildOrderBy(query: FaqQuery): Prisma.FaqOrderByWithRelationInput[] {
  const sortField = SORT_FIELDS[query.sort ?? ''];
  if (sortField) return [{ [sortField]: query.order }];
  return [{ order: 'asc' }, { createdAt: 'asc' }];
}

export const faqRepository = {
  async list(
    query: FaqQuery,
    options: { onlyPublished: boolean },
  ): Promise<{ rows: FaqRow[]; total: number }> {
    const where = buildWhere(query, options.onlyPublished);
    const orderBy = buildOrderBy(query);
    const skip = (query.page - 1) * query.limit;

    const [rows, total] = await prisma.$transaction([
      prisma.faq.findMany({ where, orderBy, skip, take: query.limit }),
      prisma.faq.count({ where }),
    ]);
    return { rows, total };
  },

  findById(id: string): Promise<FaqRow | null> {
    return prisma.faq.findFirst({ where: { id } });
  },

  create(data: Prisma.FaqUncheckedCreateInput): Promise<FaqRow> {
    return prisma.faq.create({ data });
  },

  update(id: string, data: Prisma.FaqUncheckedUpdateInput): Promise<FaqRow> {
    return prisma.faq.update({ where: { id }, data });
  },

  delete(id: string): Promise<unknown> {
    return prisma.faq.delete({ where: { id } });
  },
};
