import { prisma, type Destination, type Prisma } from '@travel/db';
import type { DestinationQuery } from '@travel/types';

export type DestinationRow = Destination;

const SORT_FIELDS: Record<string, keyof Prisma.DestinationOrderByWithRelationInput> = {
  name: 'nameEn',
  country: 'country',
  createdAt: 'createdAt',
};

function buildWhere(query: DestinationQuery): Prisma.DestinationWhereInput {
  const where: Prisma.DestinationWhereInput = {};

  if (query.featured !== undefined) where.featured = query.featured;
  if (query.country) where.country = query.country;
  if (query.isDomestic !== undefined) where.isDomestic = query.isDomestic;

  if (query.search) {
    where.OR = [
      { nameEn: { contains: query.search, mode: 'insensitive' } },
      { nameAr: { contains: query.search } },
      { city: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  return where;
}

export const destinationRepository = {
  async list(query: DestinationQuery): Promise<{ rows: DestinationRow[]; total: number }> {
    const where = buildWhere(query);
    const sortField = SORT_FIELDS[query.sort ?? ''] ?? 'createdAt';
    const orderBy: Prisma.DestinationOrderByWithRelationInput = { [sortField]: query.order };
    const skip = (query.page - 1) * query.limit;

    const [rows, total] = await prisma.$transaction([
      prisma.destination.findMany({ where, orderBy, skip, take: query.limit }),
      prisma.destination.count({ where }),
    ]);
    return { rows, total };
  },

  findBySlug(slug: string): Promise<DestinationRow | null> {
    return prisma.destination.findUnique({ where: { slug } });
  },

  findById(id: string): Promise<DestinationRow | null> {
    return prisma.destination.findUnique({ where: { id } });
  },

  create(data: Prisma.DestinationUncheckedCreateInput): Promise<DestinationRow> {
    return prisma.destination.create({ data });
  },

  update(id: string, data: Prisma.DestinationUncheckedUpdateInput): Promise<DestinationRow> {
    return prisma.destination.update({ where: { id }, data });
  },

  hardDelete(id: string): Promise<unknown> {
    return prisma.destination.delete({ where: { id } });
  },
};
