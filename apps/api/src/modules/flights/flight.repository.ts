import { prisma, type Prisma } from '@travel/db';
import type { FlightQuery } from '@travel/types';

export type FlightRow = Prisma.FlightGetPayload<object>;

const SORT_FIELDS: Record<string, keyof Prisma.FlightOrderByWithRelationInput> = {
  price: 'basePrice',
  departure: 'departureTime',
  createdAt: 'createdAt',
};

export const flightRepository = {
  async list(query: FlightQuery): Promise<{ rows: FlightRow[]; total: number }> {
    const where: Prisma.FlightWhereInput = {};
    if (query.origin) where.origin = query.origin.toUpperCase();
    if (query.destination) where.destination = query.destination.toUpperCase();
    if (query.cabinClass) where.cabinClass = { equals: query.cabinClass, mode: 'insensitive' };
    if (query.featured !== undefined) where.featured = query.featured;
    if (query.search) {
      where.OR = [
        { airline: { contains: query.search, mode: 'insensitive' } },
        { flightNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const sortField = SORT_FIELDS[query.sort ?? ''] ?? 'departureTime';
    const orderBy: Prisma.FlightOrderByWithRelationInput = { [sortField]: query.order };
    const skip = (query.page - 1) * query.limit;
    const [rows, total] = await prisma.$transaction([
      prisma.flight.findMany({ where, orderBy, skip, take: query.limit }),
      prisma.flight.count({ where }),
    ]);
    return { rows, total };
  },

  findById(id: string): Promise<FlightRow | null> {
    return prisma.flight.findUnique({ where: { id } });
  },

  create(data: Prisma.FlightUncheckedCreateInput): Promise<FlightRow> {
    return prisma.flight.create({ data });
  },

  update(id: string, data: Prisma.FlightUncheckedUpdateInput): Promise<FlightRow> {
    return prisma.flight.update({ where: { id }, data });
  },

  delete(id: string): Promise<unknown> {
    return prisma.flight.delete({ where: { id } });
  },
};
