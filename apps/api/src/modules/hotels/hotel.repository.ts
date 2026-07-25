import { prisma, type Prisma } from '@travel/db';
import type { HotelImageInput, HotelQuery, HotelRoomInput } from '@travel/types';

const refSelect = { id: true, slug: true, nameEn: true, nameAr: true } as const;

const listInclude = {
  destination: { select: refSelect },
  images: { orderBy: { order: 'asc' }, take: 1, select: { url: true } },
} satisfies Prisma.HotelInclude;

const detailInclude = {
  destination: { select: refSelect },
  images: { orderBy: { order: 'asc' } },
  rooms: { orderBy: { pricePerNight: 'asc' } },
} satisfies Prisma.HotelInclude;

export type HotelListRow = Prisma.HotelGetPayload<{ include: typeof listInclude }>;
export type HotelDetailRow = Prisma.HotelGetPayload<{ include: typeof detailInclude }>;

export interface HotelNestedReplace {
  images?: HotelImageInput[];
  rooms?: HotelRoomInput[];
}

const SORT_FIELDS: Record<string, keyof Prisma.HotelOrderByWithRelationInput> = {
  starRating: 'starRating',
  price: 'basePricePerNight',
  name: 'nameEn',
  createdAt: 'createdAt',
};

function buildWhere(query: HotelQuery): Prisma.HotelWhereInput {
  const where: Prisma.HotelWhereInput = {};
  if (query.city) where.city = { equals: query.city, mode: 'insensitive' };
  if (query.featured !== undefined) where.featured = query.featured;
  if (query.starRating !== undefined) where.starRating = { gte: query.starRating };
  if (query.destinationId) where.destinationId = query.destinationId;
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.basePricePerNight = { gte: query.minPrice, lte: query.maxPrice };
  }
  if (query.search) {
    where.OR = [
      { nameEn: { contains: query.search, mode: 'insensitive' } },
      { nameAr: { contains: query.search } },
      { city: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  return where;
}

export const hotelRepository = {
  async list(query: HotelQuery): Promise<{ rows: HotelListRow[]; total: number }> {
    const where = buildWhere(query);
    const sortField = SORT_FIELDS[query.sort ?? ''] ?? 'starRating';
    const orderBy: Prisma.HotelOrderByWithRelationInput = { [sortField]: query.order };
    const skip = (query.page - 1) * query.limit;

    const [rows, total] = await prisma.$transaction([
      prisma.hotel.findMany({ where, include: listInclude, orderBy, skip, take: query.limit }),
      prisma.hotel.count({ where }),
    ]);
    return { rows, total };
  },

  findBySlug(slug: string): Promise<HotelDetailRow | null> {
    return prisma.hotel.findUnique({ where: { slug }, include: detailInclude });
  },

  findById(id: string): Promise<HotelDetailRow | null> {
    return prisma.hotel.findUnique({ where: { id }, include: detailInclude });
  },

  create(data: Prisma.HotelUncheckedCreateInput): Promise<HotelDetailRow> {
    return prisma.hotel.create({ data, include: detailInclude });
  },

  async update(
    id: string,
    scalar: Prisma.HotelUncheckedUpdateInput,
    nested: HotelNestedReplace,
  ): Promise<HotelDetailRow | null> {
    return prisma.$transaction(async (tx) => {
      if (nested.images) {
        await tx.hotelImage.deleteMany({ where: { hotelId: id } });
        if (nested.images.length) {
          await tx.hotelImage.createMany({
            data: nested.images.map((image) => ({ ...image, hotelId: id })),
          });
        }
      }
      if (nested.rooms) {
        await tx.hotelRoom.deleteMany({ where: { hotelId: id } });
        if (nested.rooms.length) {
          await tx.hotelRoom.createMany({
            data: nested.rooms.map((room) => ({ ...room, hotelId: id })),
          });
        }
      }
      await tx.hotel.update({ where: { id }, data: scalar });
      return tx.hotel.findUnique({ where: { id }, include: detailInclude });
    });
  },

  delete(id: string): Promise<unknown> {
    return prisma.hotel.delete({ where: { id } });
  },
};
