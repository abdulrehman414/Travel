import type { DestinationDetailDto, DestinationListItemDto } from '@travel/types';
import type { DestinationRow } from './destination.repository';

export function toDestinationListItem(row: DestinationRow): DestinationListItemDto {
  return {
    id: row.id,
    slug: row.slug,
    nameEn: row.nameEn,
    nameAr: row.nameAr,
    country: row.country,
    city: row.city,
    region: row.region,
    isDomestic: row.isDomestic,
    latitude: row.latitude,
    longitude: row.longitude,
    heroImageUrl: row.heroImageUrl,
    featured: row.featured,
  };
}

export function toDestinationDetail(row: DestinationRow): DestinationDetailDto {
  return {
    ...toDestinationListItem(row),
    descriptionEn: row.descriptionEn,
    descriptionAr: row.descriptionAr,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
