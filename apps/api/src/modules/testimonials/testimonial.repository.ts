import { prisma, type Prisma, type Testimonial } from '@travel/db';
import type { TestimonialQuery } from '@travel/types';

export type TestimonialRow = Testimonial;

const SORT_FIELDS: Record<string, keyof Prisma.TestimonialOrderByWithRelationInput> = {
  rating: 'rating',
  order: 'order',
  createdAt: 'createdAt',
};

function buildWhere(query: TestimonialQuery, onlyApproved: boolean): Prisma.TestimonialWhereInput {
  const where: Prisma.TestimonialWhereInput = {};

  if (onlyApproved) where.status = 'APPROVED';
  else if (query.status) where.status = query.status;

  if (query.featured !== undefined) where.featured = query.featured;

  if (query.search) {
    where.OR = [
      { authorName: { contains: query.search, mode: 'insensitive' } },
      { quoteEn: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  return where;
}

export const testimonialRepository = {
  async list(
    query: TestimonialQuery,
    options: { onlyApproved: boolean },
  ): Promise<{ rows: TestimonialRow[]; total: number }> {
    const where = buildWhere(query, options.onlyApproved);
    const sortField = SORT_FIELDS[query.sort ?? ''];
    const orderBy: Prisma.TestimonialOrderByWithRelationInput = sortField
      ? { [sortField]: query.order }
      : { order: 'asc' };
    const skip = (query.page - 1) * query.limit;

    const [rows, total] = await prisma.$transaction([
      prisma.testimonial.findMany({ where, orderBy, skip, take: query.limit }),
      prisma.testimonial.count({ where }),
    ]);
    return { rows, total };
  },

  findById(id: string): Promise<TestimonialRow | null> {
    return prisma.testimonial.findUnique({ where: { id } });
  },

  create(data: Prisma.TestimonialUncheckedCreateInput): Promise<TestimonialRow> {
    return prisma.testimonial.create({ data });
  },

  update(id: string, data: Prisma.TestimonialUncheckedUpdateInput): Promise<TestimonialRow> {
    return prisma.testimonial.update({ where: { id }, data });
  },

  setStatus(
    id: string,
    status: Prisma.TestimonialUpdateInput['status'],
  ): Promise<TestimonialRow> {
    return prisma.testimonial.update({ where: { id }, data: { status } });
  },

  delete(id: string): Promise<TestimonialRow> {
    return prisma.testimonial.delete({ where: { id } });
  },
};
