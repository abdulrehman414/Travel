import { buildPageMeta } from '@travel/types';
import type {
  CreatePackageInput,
  PackageDetailDto,
  PackageListItemDto,
  PackageQuery,
  Paginated,
  PackageStatus,
  UpdatePackageInput,
} from '@travel/types';
import type { Prisma } from '@travel/db';
import { packageRepository, type PackageNestedReplace } from './package.repository';
import { toPackageDetail, toPackageListItem } from './package.mapper';
import { ConflictError, NotFoundError } from '../../lib/api-error';

function toCreateData(input: CreatePackageInput): Prisma.PackageUncheckedCreateInput {
  return {
    slug: input.slug,
    type: input.type,
    status: input.status,
    titleEn: input.titleEn,
    titleAr: input.titleAr,
    summaryEn: input.summaryEn,
    summaryAr: input.summaryAr,
    descriptionEn: input.descriptionEn,
    descriptionAr: input.descriptionAr,
    durationDays: input.durationDays,
    durationNights: input.durationNights,
    basePrice: input.basePrice,
    salePrice: input.salePrice,
    currency: input.currency,
    maxGroupSize: input.maxGroupSize,
    minGroupSize: input.minGroupSize,
    featured: input.featured,
    heroImageUrl: input.heroImageUrl,
    mapEmbedUrl: input.mapEmbedUrl,
    latitude: input.latitude,
    longitude: input.longitude,
    metaTitleEn: input.metaTitleEn,
    metaTitleAr: input.metaTitleAr,
    metaDescriptionEn: input.metaDescriptionEn,
    metaDescriptionAr: input.metaDescriptionAr,
    categoryId: input.categoryId,
    destinationId: input.destinationId,
    publishedAt: input.status === 'PUBLISHED' ? new Date() : null,
    ...(input.images ? { images: { create: input.images } } : {}),
    ...(input.itinerary ? { itinerary: { create: input.itinerary } } : {}),
    ...(input.inclusions ? { inclusions: { create: input.inclusions } } : {}),
    ...(input.departures ? { departures: { create: input.departures } } : {}),
    ...(input.tagIds ? { tags: { create: input.tagIds.map((tagId) => ({ tagId })) } } : {}),
  };
}

export const packageService = {
  async listPublic(query: PackageQuery): Promise<Paginated<PackageListItemDto>> {
    const { rows, total } = await packageRepository.list(query, { onlyPublished: true });
    return { items: rows.map(toPackageListItem), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async listAdmin(query: PackageQuery): Promise<Paginated<PackageListItemDto>> {
    const { rows, total } = await packageRepository.list(query, { onlyPublished: false });
    return { items: rows.map(toPackageListItem), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async getBySlug(slug: string): Promise<PackageDetailDto> {
    const row = await packageRepository.findBySlugPublished(slug);
    if (!row) throw new NotFoundError('Package not found');
    return toPackageDetail(row);
  },

  async getByIdAdmin(id: string): Promise<PackageDetailDto> {
    const row = await packageRepository.findById(id);
    if (!row) throw new NotFoundError('Package not found');
    return toPackageDetail(row);
  },

  async create(input: CreatePackageInput): Promise<PackageDetailDto> {
    try {
      const row = await packageRepository.create(toCreateData(input));
      return toPackageDetail(row);
    } catch (error) {
      if (isUniqueSlugError(error)) throw new ConflictError('A package with this slug already exists');
      throw error;
    }
  },

  async update(id: string, input: UpdatePackageInput): Promise<PackageDetailDto> {
    const existing = await packageRepository.findById(id);
    if (!existing) throw new NotFoundError('Package not found');

    const { images, itinerary, inclusions, departures, tagIds, status, ...rest } = input;
    const scalar: Prisma.PackageUncheckedUpdateInput = { ...rest };
    if (status !== undefined) {
      scalar.status = status;
      if (status === 'PUBLISHED' && !existing.publishedAt) scalar.publishedAt = new Date();
    }

    const nested: PackageNestedReplace = { images, itinerary, inclusions, departures, tagIds };

    try {
      const row = await packageRepository.update(id, scalar, nested);
      if (!row) throw new NotFoundError('Package not found');
      return toPackageDetail(row);
    } catch (error) {
      if (isUniqueSlugError(error)) throw new ConflictError('A package with this slug already exists');
      throw error;
    }
  },

  async remove(id: string): Promise<void> {
    const existing = await packageRepository.findById(id);
    if (!existing) throw new NotFoundError('Package not found');
    await packageRepository.softDelete(id);
  },

  async setStatus(id: string, status: PackageStatus): Promise<PackageDetailDto> {
    const existing = await packageRepository.findById(id);
    if (!existing) throw new NotFoundError('Package not found');
    const row = await packageRepository.setStatus(id, status);
    return toPackageDetail(row);
  },
};

function isUniqueSlugError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002'
  );
}
