import type { Prisma } from '@travel/db';
import type {
  DepartureDto,
  InclusionDto,
  ItineraryDayDto,
  PackageDetailDto,
  PackageImageDto,
  PackageListItemDto,
  PackageRefDto,
} from '@travel/types';
import type { PackageDetailRow, PackageListRow } from './package.repository';

const toNumber = (value: Prisma.Decimal | null): number | null =>
  value === null ? null : Number(value);

const iso = (value: Date | null): string | null => (value ? value.toISOString() : null);

function toRef(
  ref: { id: string; slug: string; nameEn: string; nameAr: string } | null,
): PackageRefDto | null {
  return ref ? { id: ref.id, slug: ref.slug, nameEn: ref.nameEn, nameAr: ref.nameAr } : null;
}

export function toPackageListItem(row: PackageListRow): PackageListItemDto {
  return {
    id: row.id,
    slug: row.slug,
    type: row.type,
    status: row.status,
    titleEn: row.titleEn,
    titleAr: row.titleAr,
    summaryEn: row.summaryEn,
    summaryAr: row.summaryAr,
    durationDays: row.durationDays,
    durationNights: row.durationNights,
    basePrice: Number(row.basePrice),
    salePrice: toNumber(row.salePrice),
    currency: row.currency,
    rating: row.rating,
    reviewCount: row.reviewCount,
    featured: row.featured,
    heroImageUrl: row.heroImageUrl,
    coverImageUrl: row.images[0]?.url ?? row.heroImageUrl ?? null,
    destination: toRef(row.destination),
    category: toRef(row.category),
  };
}

function toImage(image: PackageDetailRow['images'][number]): PackageImageDto {
  return {
    id: image.id,
    url: image.url,
    altEn: image.altEn,
    altAr: image.altAr,
    order: image.order,
    isCover: image.isCover,
  };
}

function toItineraryDay(day: PackageDetailRow['itinerary'][number]): ItineraryDayDto {
  return {
    id: day.id,
    dayNumber: day.dayNumber,
    titleEn: day.titleEn,
    titleAr: day.titleAr,
    descriptionEn: day.descriptionEn,
    descriptionAr: day.descriptionAr,
    location: day.location,
    latitude: day.latitude,
    longitude: day.longitude,
  };
}

function toInclusion(inc: PackageDetailRow['inclusions'][number]): InclusionDto {
  return { id: inc.id, type: inc.type, labelEn: inc.labelEn, labelAr: inc.labelAr, order: inc.order };
}

function toDeparture(dep: PackageDetailRow['departures'][number]): DepartureDto {
  return {
    id: dep.id,
    departureDate: dep.departureDate.toISOString(),
    returnDate: dep.returnDate.toISOString(),
    totalSeats: dep.totalSeats,
    bookedSeats: dep.bookedSeats,
    seatsAvailable: Math.max(0, dep.totalSeats - dep.bookedSeats),
    priceOverride: toNumber(dep.priceOverride),
    status: dep.status,
  };
}

export function toPackageDetail(row: PackageDetailRow): PackageDetailDto {
  const cover =
    row.images.find((image) => image.isCover)?.url ?? row.images[0]?.url ?? row.heroImageUrl ?? null;

  return {
    id: row.id,
    slug: row.slug,
    type: row.type,
    status: row.status,
    titleEn: row.titleEn,
    titleAr: row.titleAr,
    summaryEn: row.summaryEn,
    summaryAr: row.summaryAr,
    durationDays: row.durationDays,
    durationNights: row.durationNights,
    basePrice: Number(row.basePrice),
    salePrice: toNumber(row.salePrice),
    currency: row.currency,
    rating: row.rating,
    reviewCount: row.reviewCount,
    featured: row.featured,
    heroImageUrl: row.heroImageUrl,
    coverImageUrl: cover,
    destination: toRef(row.destination),
    category: toRef(row.category),
    descriptionEn: row.descriptionEn,
    descriptionAr: row.descriptionAr,
    maxGroupSize: row.maxGroupSize,
    minGroupSize: row.minGroupSize,
    latitude: row.latitude,
    longitude: row.longitude,
    mapEmbedUrl: row.mapEmbedUrl,
    metaTitleEn: row.metaTitleEn,
    metaTitleAr: row.metaTitleAr,
    metaDescriptionEn: row.metaDescriptionEn,
    metaDescriptionAr: row.metaDescriptionAr,
    images: row.images.map(toImage),
    itinerary: row.itinerary.map(toItineraryDay),
    inclusions: row.inclusions.map(toInclusion),
    departures: row.departures.map(toDeparture),
    tags: row.tags.map((packageTag) => ({
      id: packageTag.tag.id,
      slug: packageTag.tag.slug,
      nameEn: packageTag.tag.nameEn,
      nameAr: packageTag.tag.nameAr,
    })),
    publishedAt: iso(row.publishedAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
