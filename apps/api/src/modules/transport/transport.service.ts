import { buildPageMeta } from '@travel/types';
import type {
  CreateTransportInput,
  Paginated,
  TransportQuery,
  TransportServiceDto,
  UpdateTransportInput,
} from '@travel/types';
import { transportRepository, type TransportRow } from './transport.repository';
import { ConflictError, NotFoundError } from '../../lib/api-error';

function toDto(row: TransportRow): TransportServiceDto {
  return {
    id: row.id,
    slug: row.slug,
    type: row.type,
    vehicleClass: row.vehicleClass,
    titleEn: row.titleEn,
    titleAr: row.titleAr,
    descriptionEn: row.descriptionEn,
    descriptionAr: row.descriptionAr,
    fromCity: row.fromCity,
    toCity: row.toCity,
    city: row.city,
    durationHours: row.durationHours,
    capacity: row.capacity,
    basePrice: Number(row.basePrice),
    currency: row.currency,
    pricingUnit: row.pricingUnit,
    imageUrl: row.imageUrl,
    featuresEn: row.featuresEn,
    featuresAr: row.featuresAr,
    featured: row.featured,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
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

export const transportService = {
  async list(
    query: TransportQuery,
    options: { onlyActive: boolean },
  ): Promise<Paginated<TransportServiceDto>> {
    const { rows, total } = await transportRepository.list(query, options);
    return { items: rows.map(toDto), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async getBySlug(slug: string, onlyActive: boolean): Promise<TransportServiceDto> {
    const row = await transportRepository.findBySlug(slug, onlyActive);
    if (!row) throw new NotFoundError('Transport service not found');
    return toDto(row);
  },

  async create(input: CreateTransportInput): Promise<TransportServiceDto> {
    try {
      return toDto(await transportRepository.create(input));
    } catch (error) {
      if (isUniqueSlugError(error)) throw new ConflictError('A service with this slug already exists');
      throw error;
    }
  },

  async update(id: string, input: UpdateTransportInput): Promise<TransportServiceDto> {
    const existing = await transportRepository.findById(id);
    if (!existing) throw new NotFoundError('Transport service not found');
    try {
      return toDto(await transportRepository.update(id, input));
    } catch (error) {
      if (isUniqueSlugError(error)) throw new ConflictError('A service with this slug already exists');
      throw error;
    }
  },

  async remove(id: string): Promise<void> {
    const existing = await transportRepository.findById(id);
    if (!existing) throw new NotFoundError('Transport service not found');
    await transportRepository.delete(id);
  },
};
