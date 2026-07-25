import { prisma, type Prisma } from '@travel/db';
import type { TransportQuery } from '@travel/types';

export type TransportRow = Prisma.TransportServiceGetPayload<object>;

const SORT_FIELDS: Record<string, keyof Prisma.TransportServiceOrderByWithRelationInput> = {
  price: 'basePrice',
  createdAt: 'createdAt',
};

function buildWhere(query: TransportQuery, onlyActive: boolean): Prisma.TransportServiceWhereInput {
  const where: Prisma.TransportServiceWhereInput = {};
  const and: Prisma.TransportServiceWhereInput[] = [];

  if (onlyActive) where.active = true;
  if (query.type) where.type = query.type;
  if (query.vehicleClass) where.vehicleClass = query.vehicleClass;
  if (query.featured !== undefined) where.featured = query.featured;
  if (query.city) {
    and.push({
      OR: [
        { city: { equals: query.city, mode: 'insensitive' } },
        { fromCity: { equals: query.city, mode: 'insensitive' } },
        { toCity: { equals: query.city, mode: 'insensitive' } },
      ],
    });
  }
  if (query.search) {
    and.push({
      OR: [
        { titleEn: { contains: query.search, mode: 'insensitive' } },
        { titleAr: { contains: query.search } },
      ],
    });
  }
  if (and.length > 0) where.AND = and;
  return where;
}

export const transportRepository = {
  async list(
    query: TransportQuery,
    options: { onlyActive: boolean },
  ): Promise<{ rows: TransportRow[]; total: number }> {
    const where = buildWhere(query, options.onlyActive);
    const sortField = SORT_FIELDS[query.sort ?? ''] ?? 'basePrice';
    const orderBy: Prisma.TransportServiceOrderByWithRelationInput = { [sortField]: query.order };
    const skip = (query.page - 1) * query.limit;
    const [rows, total] = await prisma.$transaction([
      prisma.transportService.findMany({ where, orderBy, skip, take: query.limit }),
      prisma.transportService.count({ where }),
    ]);
    return { rows, total };
  },

  findBySlug(slug: string, onlyActive: boolean): Promise<TransportRow | null> {
    return prisma.transportService.findFirst({
      where: onlyActive ? { slug, active: true } : { slug },
    });
  },

  findById(id: string): Promise<TransportRow | null> {
    return prisma.transportService.findUnique({ where: { id } });
  },

  create(data: Prisma.TransportServiceUncheckedCreateInput): Promise<TransportRow> {
    return prisma.transportService.create({ data });
  },

  update(id: string, data: Prisma.TransportServiceUncheckedUpdateInput): Promise<TransportRow> {
    return prisma.transportService.update({ where: { id }, data });
  },

  delete(id: string): Promise<unknown> {
    return prisma.transportService.delete({ where: { id } });
  },
};
