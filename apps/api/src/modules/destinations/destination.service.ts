import { buildPageMeta } from '@travel/types';
import type {
  CreateDestinationInput,
  DestinationDetailDto,
  DestinationListItemDto,
  DestinationQuery,
  Paginated,
  UpdateDestinationInput,
} from '@travel/types';
import type { Prisma } from '@travel/db';
import { destinationRepository } from './destination.repository';
import { toDestinationDetail, toDestinationListItem } from './destination.mapper';
import { ConflictError, NotFoundError } from '../../lib/api-error';

function toCreateData(input: CreateDestinationInput): Prisma.DestinationUncheckedCreateInput {
  return {
    slug: input.slug,
    nameEn: input.nameEn,
    nameAr: input.nameAr,
    descriptionEn: input.descriptionEn,
    descriptionAr: input.descriptionAr,
    country: input.country,
    city: input.city,
    region: input.region,
    isDomestic: input.isDomestic,
    latitude: input.latitude,
    longitude: input.longitude,
    heroImageUrl: input.heroImageUrl,
    featured: input.featured,
  };
}

export const destinationService = {
  async listPublic(query: DestinationQuery): Promise<Paginated<DestinationListItemDto>> {
    const { rows, total } = await destinationRepository.list(query);
    return {
      items: rows.map(toDestinationListItem),
      meta: buildPageMeta(total, query.page, query.limit),
    };
  },

  async listAdmin(query: DestinationQuery): Promise<Paginated<DestinationListItemDto>> {
    const { rows, total } = await destinationRepository.list(query);
    return {
      items: rows.map(toDestinationListItem),
      meta: buildPageMeta(total, query.page, query.limit),
    };
  },

  async getBySlug(slug: string): Promise<DestinationDetailDto> {
    const row = await destinationRepository.findBySlug(slug);
    if (!row) throw new NotFoundError('Destination not found');
    return toDestinationDetail(row);
  },

  async getByIdAdmin(id: string): Promise<DestinationDetailDto> {
    const row = await destinationRepository.findById(id);
    if (!row) throw new NotFoundError('Destination not found');
    return toDestinationDetail(row);
  },

  async create(input: CreateDestinationInput): Promise<DestinationDetailDto> {
    try {
      const row = await destinationRepository.create(toCreateData(input));
      return toDestinationDetail(row);
    } catch (error) {
      if (isUniqueSlugError(error)) {
        throw new ConflictError('A destination with this slug already exists');
      }
      throw error;
    }
  },

  async update(id: string, input: UpdateDestinationInput): Promise<DestinationDetailDto> {
    const existing = await destinationRepository.findById(id);
    if (!existing) throw new NotFoundError('Destination not found');

    const data: Prisma.DestinationUncheckedUpdateInput = { ...input };

    try {
      const row = await destinationRepository.update(id, data);
      return toDestinationDetail(row);
    } catch (error) {
      if (isUniqueSlugError(error)) {
        throw new ConflictError('A destination with this slug already exists');
      }
      throw error;
    }
  },

  async remove(id: string): Promise<void> {
    const existing = await destinationRepository.findById(id);
    if (!existing) throw new NotFoundError('Destination not found');
    await destinationRepository.hardDelete(id);
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
