import { buildPageMeta } from '@travel/types';
import type {
  CreateHotelInput,
  HotelDetailDto,
  HotelListItemDto,
  HotelQuery,
  Paginated,
  UpdateHotelInput,
} from '@travel/types';
import type { Prisma } from '@travel/db';
import { hotelRepository, type HotelNestedReplace } from './hotel.repository';
import { toHotelDetail, toHotelListItem } from './hotel.mapper';
import { ConflictError, NotFoundError } from '../../lib/api-error';

function toCreateData(input: CreateHotelInput): Prisma.HotelUncheckedCreateInput {
  return {
    slug: input.slug,
    externalId: input.externalId,
    nameEn: input.nameEn,
    nameAr: input.nameAr,
    descriptionEn: input.descriptionEn,
    descriptionAr: input.descriptionAr,
    starRating: input.starRating,
    address: input.address,
    city: input.city,
    country: input.country,
    latitude: input.latitude,
    longitude: input.longitude,
    distanceToHaramMeters: input.distanceToHaramMeters,
    basePricePerNight: input.basePricePerNight,
    currency: input.currency,
    heroImageUrl: input.heroImageUrl,
    amenities: input.amenities,
    featured: input.featured,
    destinationId: input.destinationId,
    ...(input.images ? { images: { create: input.images } } : {}),
    ...(input.rooms ? { rooms: { create: input.rooms } } : {}),
  };
}

function isUniqueSlugError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002'
  );
}

export const hotelService = {
  async list(query: HotelQuery): Promise<Paginated<HotelListItemDto>> {
    const { rows, total } = await hotelRepository.list(query);
    return { items: rows.map(toHotelListItem), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async getBySlug(slug: string): Promise<HotelDetailDto> {
    const row = await hotelRepository.findBySlug(slug);
    if (!row) throw new NotFoundError('Hotel not found');
    return toHotelDetail(row);
  },

  async getById(id: string): Promise<HotelDetailDto> {
    const row = await hotelRepository.findById(id);
    if (!row) throw new NotFoundError('Hotel not found');
    return toHotelDetail(row);
  },

  async create(input: CreateHotelInput): Promise<HotelDetailDto> {
    try {
      const row = await hotelRepository.create(toCreateData(input));
      return toHotelDetail(row);
    } catch (error) {
      if (isUniqueSlugError(error)) throw new ConflictError('A hotel with this slug already exists');
      throw error;
    }
  },

  async update(id: string, input: UpdateHotelInput): Promise<HotelDetailDto> {
    const existing = await hotelRepository.findById(id);
    if (!existing) throw new NotFoundError('Hotel not found');

    const { images, rooms, ...rest } = input;
    const scalar: Prisma.HotelUncheckedUpdateInput = { ...rest };
    const nested: HotelNestedReplace = { images, rooms };

    try {
      const row = await hotelRepository.update(id, scalar, nested);
      if (!row) throw new NotFoundError('Hotel not found');
      return toHotelDetail(row);
    } catch (error) {
      if (isUniqueSlugError(error)) throw new ConflictError('A hotel with this slug already exists');
      throw error;
    }
  },

  async remove(id: string): Promise<void> {
    const existing = await hotelRepository.findById(id);
    if (!existing) throw new NotFoundError('Hotel not found');
    await hotelRepository.delete(id);
  },
};
