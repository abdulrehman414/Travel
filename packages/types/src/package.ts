import { z } from 'zod';
import { booleanQueryParam, paginationQuerySchema } from './common';
import {
  currencySchema,
  departureStatusSchema,
  inclusionTypeSchema,
  packageStatusSchema,
  packageTypeSchema,
  type Currency,
  type DepartureStatus,
  type InclusionType,
  type PackageStatus,
  type PackageType,
} from './enums';

const slugField = z
  .string()
  .min(3)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug');

const imageUrl = z.union([z.string().url(), z.string().startsWith('/')]);

// --------------------------------------------------------------- inputs -----

export const packageImageInputSchema = z.object({
  url: imageUrl,
  altEn: z.string().max(200).optional(),
  altAr: z.string().max(200).optional(),
  order: z.number().int().min(0).default(0),
  isCover: z.boolean().default(false),
});
export type PackageImageInput = z.infer<typeof packageImageInputSchema>;

export const itineraryDayInputSchema = z.object({
  dayNumber: z.number().int().min(1).max(60),
  titleEn: z.string().trim().min(1).max(200),
  titleAr: z.string().trim().min(1).max(200),
  descriptionEn: z.string().trim().min(1),
  descriptionAr: z.string().trim().min(1),
  location: z.string().max(160).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});
export type ItineraryDayInput = z.infer<typeof itineraryDayInputSchema>;

export const inclusionInputSchema = z.object({
  type: inclusionTypeSchema,
  labelEn: z.string().trim().min(1).max(200),
  labelAr: z.string().trim().min(1).max(200),
  order: z.number().int().min(0).default(0),
});
export type InclusionInput = z.infer<typeof inclusionInputSchema>;

export const departureInputSchema = z.object({
  departureDate: z.coerce.date(),
  returnDate: z.coerce.date(),
  totalSeats: z.number().int().min(1),
  bookedSeats: z.number().int().min(0).default(0),
  priceOverride: z.number().nonnegative().optional(),
  status: departureStatusSchema.default('OPEN'),
});
export type DepartureInput = z.infer<typeof departureInputSchema>;

export const createPackageSchema = z.object({
  slug: slugField,
  type: packageTypeSchema,
  status: packageStatusSchema.default('DRAFT'),
  titleEn: z.string().trim().min(3).max(200),
  titleAr: z.string().trim().min(3).max(200),
  summaryEn: z.string().trim().min(3).max(600),
  summaryAr: z.string().trim().min(3).max(600),
  descriptionEn: z.string().trim().min(3),
  descriptionAr: z.string().trim().min(3),
  durationDays: z.number().int().min(1).max(60),
  durationNights: z.number().int().min(0).max(60),
  basePrice: z.number().nonnegative(),
  salePrice: z.number().nonnegative().optional(),
  currency: currencySchema.default('SAR'),
  maxGroupSize: z.number().int().min(1).default(30),
  minGroupSize: z.number().int().min(1).default(1),
  featured: z.boolean().default(false),
  heroImageUrl: imageUrl.optional(),
  mapEmbedUrl: z.string().url().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  metaTitleEn: z.string().max(200).optional(),
  metaTitleAr: z.string().max(200).optional(),
  metaDescriptionEn: z.string().max(320).optional(),
  metaDescriptionAr: z.string().max(320).optional(),
  categoryId: z.string().optional(),
  destinationId: z.string().optional(),
  images: z.array(packageImageInputSchema).optional(),
  itinerary: z.array(itineraryDayInputSchema).optional(),
  inclusions: z.array(inclusionInputSchema).optional(),
  departures: z.array(departureInputSchema).optional(),
  tagIds: z.array(z.string()).optional(),
});
export type CreatePackageInput = z.infer<typeof createPackageSchema>;

export const updatePackageSchema = createPackageSchema.partial();
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;

export const setPackageStatusSchema = z.object({ status: packageStatusSchema });
export type SetPackageStatusInput = z.infer<typeof setPackageStatusSchema>;

export const packageQuerySchema = paginationQuerySchema.extend({
  type: packageTypeSchema.optional(),
  status: packageStatusSchema.optional(),
  featured: booleanQueryParam.optional(),
  destinationId: z.string().optional(),
  categoryId: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  minDuration: z.coerce.number().int().min(0).optional(),
  maxDuration: z.coerce.number().int().min(0).optional(),
});
export type PackageQuery = z.infer<typeof packageQuerySchema>;

// -------------------------------------------------------------- outputs -----

export interface PackageRefDto {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
}

export interface PackageImageDto {
  id: string;
  url: string;
  altEn: string | null;
  altAr: string | null;
  order: number;
  isCover: boolean;
}

export interface ItineraryDayDto {
  id: string;
  dayNumber: number;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface InclusionDto {
  id: string;
  type: InclusionType;
  labelEn: string;
  labelAr: string;
  order: number;
}

export interface DepartureDto {
  id: string;
  departureDate: string;
  returnDate: string;
  totalSeats: number;
  bookedSeats: number;
  seatsAvailable: number;
  priceOverride: number | null;
  status: DepartureStatus;
}

export interface PackageListItemDto {
  id: string;
  slug: string;
  type: PackageType;
  status: PackageStatus;
  titleEn: string;
  titleAr: string;
  summaryEn: string;
  summaryAr: string;
  durationDays: number;
  durationNights: number;
  basePrice: number;
  salePrice: number | null;
  currency: Currency;
  rating: number;
  reviewCount: number;
  featured: boolean;
  heroImageUrl: string | null;
  coverImageUrl: string | null;
  destination: PackageRefDto | null;
  category: PackageRefDto | null;
}

export interface PackageDetailDto extends PackageListItemDto {
  descriptionEn: string;
  descriptionAr: string;
  maxGroupSize: number;
  minGroupSize: number;
  latitude: number | null;
  longitude: number | null;
  mapEmbedUrl: string | null;
  metaTitleEn: string | null;
  metaTitleAr: string | null;
  metaDescriptionEn: string | null;
  metaDescriptionAr: string | null;
  images: PackageImageDto[];
  itinerary: ItineraryDayDto[];
  inclusions: InclusionDto[];
  departures: DepartureDto[];
  tags: PackageRefDto[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
