import { prisma, type Prisma } from '@travel/db';
import type {
  DepartureInput,
  InclusionInput,
  ItineraryDayInput,
  PackageImageInput,
  PackageQuery,
} from '@travel/types';

const refSelect = { id: true, slug: true, nameEn: true, nameAr: true } as const;

const listInclude = {
  destination: { select: refSelect },
  category: { select: refSelect },
  images: { where: { isCover: true }, take: 1, select: { url: true } },
} satisfies Prisma.PackageInclude;

const detailInclude = {
  destination: { select: refSelect },
  category: { select: refSelect },
  images: { orderBy: { order: 'asc' } },
  itinerary: { orderBy: { dayNumber: 'asc' } },
  inclusions: { orderBy: { order: 'asc' } },
  departures: { orderBy: { departureDate: 'asc' } },
  tags: { include: { tag: { select: refSelect } } },
} satisfies Prisma.PackageInclude;

export type PackageListRow = Prisma.PackageGetPayload<{ include: typeof listInclude }>;
export type PackageDetailRow = Prisma.PackageGetPayload<{ include: typeof detailInclude }>;

export interface PackageNestedReplace {
  images?: PackageImageInput[];
  itinerary?: ItineraryDayInput[];
  inclusions?: InclusionInput[];
  departures?: DepartureInput[];
  tagIds?: string[];
}

const SORT_FIELDS: Record<string, keyof Prisma.PackageOrderByWithRelationInput> = {
  price: 'basePrice',
  rating: 'rating',
  duration: 'durationDays',
  title: 'titleEn',
  createdAt: 'createdAt',
};

function buildWhere(query: PackageQuery, onlyPublished: boolean): Prisma.PackageWhereInput {
  const where: Prisma.PackageWhereInput = { deletedAt: null };

  if (onlyPublished) where.status = 'PUBLISHED';
  else if (query.status) where.status = query.status;

  if (query.type) where.type = query.type;
  if (query.featured !== undefined) where.featured = query.featured;
  if (query.destinationId) where.destinationId = query.destinationId;
  if (query.categoryId) where.categoryId = query.categoryId;

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.basePrice = { gte: query.minPrice, lte: query.maxPrice };
  }
  if (query.minDuration !== undefined || query.maxDuration !== undefined) {
    where.durationDays = { gte: query.minDuration, lte: query.maxDuration };
  }
  if (query.search) {
    where.OR = [
      { titleEn: { contains: query.search, mode: 'insensitive' } },
      { titleAr: { contains: query.search } },
      { summaryEn: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  return where;
}

export const packageRepository = {
  async list(
    query: PackageQuery,
    options: { onlyPublished: boolean },
  ): Promise<{ rows: PackageListRow[]; total: number }> {
    const where = buildWhere(query, options.onlyPublished);
    const sortField = SORT_FIELDS[query.sort ?? ''] ?? 'createdAt';
    const orderBy: Prisma.PackageOrderByWithRelationInput = { [sortField]: query.order };
    const skip = (query.page - 1) * query.limit;

    const [rows, total] = await prisma.$transaction([
      prisma.package.findMany({ where, include: listInclude, orderBy, skip, take: query.limit }),
      prisma.package.count({ where }),
    ]);
    return { rows, total };
  },

  findBySlugPublished(slug: string): Promise<PackageDetailRow | null> {
    return prisma.package.findFirst({
      where: { slug, status: 'PUBLISHED', deletedAt: null },
      include: detailInclude,
    });
  },

  findById(id: string): Promise<PackageDetailRow | null> {
    return prisma.package.findFirst({ where: { id, deletedAt: null }, include: detailInclude });
  },

  create(data: Prisma.PackageUncheckedCreateInput): Promise<PackageDetailRow> {
    return prisma.package.create({ data, include: detailInclude });
  },

  async update(
    id: string,
    scalar: Prisma.PackageUncheckedUpdateInput,
    nested: PackageNestedReplace,
  ): Promise<PackageDetailRow | null> {
    return prisma.$transaction(async (tx) => {
      if (nested.images) {
        await tx.packageImage.deleteMany({ where: { packageId: id } });
        if (nested.images.length) {
          await tx.packageImage.createMany({
            data: nested.images.map((i) => ({ ...i, packageId: id })),
          });
        }
      }
      if (nested.itinerary) {
        await tx.itineraryDay.deleteMany({ where: { packageId: id } });
        if (nested.itinerary.length) {
          await tx.itineraryDay.createMany({
            data: nested.itinerary.map((d) => ({ ...d, packageId: id })),
          });
        }
      }
      if (nested.inclusions) {
        await tx.packageInclusion.deleteMany({ where: { packageId: id } });
        if (nested.inclusions.length) {
          await tx.packageInclusion.createMany({
            data: nested.inclusions.map((i) => ({ ...i, packageId: id })),
          });
        }
      }
      if (nested.departures) {
        await tx.packageDeparture.deleteMany({ where: { packageId: id } });
        if (nested.departures.length) {
          await tx.packageDeparture.createMany({
            data: nested.departures.map((d) => ({ ...d, packageId: id })),
          });
        }
      }
      if (nested.tagIds) {
        await tx.packageTag.deleteMany({ where: { packageId: id } });
        if (nested.tagIds.length) {
          await tx.packageTag.createMany({
            data: nested.tagIds.map((tagId) => ({ packageId: id, tagId })),
          });
        }
      }
      await tx.package.update({ where: { id }, data: scalar });
      return tx.package.findFirst({ where: { id }, include: detailInclude });
    });
  },

  softDelete(id: string): Promise<unknown> {
    return prisma.package.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'ARCHIVED' },
    });
  },

  setStatus(id: string, status: Prisma.PackageUpdateInput['status']): Promise<PackageDetailRow> {
    const publishedAt = status === 'PUBLISHED' ? new Date() : undefined;
    return prisma.package.update({
      where: { id },
      data: { status, ...(publishedAt ? { publishedAt } : {}) },
      include: detailInclude,
    });
  },
};
