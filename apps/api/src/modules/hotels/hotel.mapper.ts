import type { Prisma } from '@travel/db';
import type {
  HotelDetailDto,
  HotelListItemDto,
  HotelRefDto,
  HotelRoomDto,
} from '@travel/types';
import type { HotelDetailRow, HotelListRow } from './hotel.repository';

const toNumber = (value: Prisma.Decimal | null): number | null =>
  value === null ? null : Number(value);

function toRef(
  ref: { id: string; slug: string; nameEn: string; nameAr: string } | null,
): HotelRefDto | null {
  return ref ? { id: ref.id, slug: ref.slug, nameEn: ref.nameEn, nameAr: ref.nameAr } : null;
}

export function toHotelListItem(row: HotelListRow): HotelListItemDto {
  return {
    id: row.id,
    slug: row.slug,
    nameEn: row.nameEn,
    nameAr: row.nameAr,
    starRating: row.starRating,
    city: row.city,
    country: row.country,
    distanceToHaramMeters: row.distanceToHaramMeters,
    basePricePerNight: toNumber(row.basePricePerNight),
    currency: row.currency,
    heroImageUrl: row.heroImageUrl,
    coverImageUrl: row.images[0]?.url ?? row.heroImageUrl ?? null,
    featured: row.featured,
    amenities: row.amenities,
    destination: toRef(row.destination),
  };
}

function toRoom(room: HotelDetailRow['rooms'][number]): HotelRoomDto {
  return {
    id: room.id,
    nameEn: room.nameEn,
    nameAr: room.nameAr,
    capacity: room.capacity,
    pricePerNight: Number(room.pricePerNight),
    currency: room.currency,
    boardType: room.boardType,
  };
}

export function toHotelDetail(row: HotelDetailRow): HotelDetailDto {
  return {
    id: row.id,
    slug: row.slug,
    nameEn: row.nameEn,
    nameAr: row.nameAr,
    starRating: row.starRating,
    city: row.city,
    country: row.country,
    distanceToHaramMeters: row.distanceToHaramMeters,
    basePricePerNight: toNumber(row.basePricePerNight),
    currency: row.currency,
    heroImageUrl: row.heroImageUrl,
    coverImageUrl: row.images[0]?.url ?? row.heroImageUrl ?? null,
    featured: row.featured,
    amenities: row.amenities,
    destination: toRef(row.destination),
    externalId: row.externalId,
    descriptionEn: row.descriptionEn,
    descriptionAr: row.descriptionAr,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    images: row.images.map((image) => ({ id: image.id, url: image.url, order: image.order })),
    rooms: row.rooms.map(toRoom),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
