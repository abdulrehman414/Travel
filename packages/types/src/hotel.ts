import { z } from 'zod';
import { booleanQueryParam, paginationQuerySchema } from './common';
import { currencySchema, type Currency } from './enums';

const slugField = z
  .string()
  .min(3)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug');
const imageUrl = z.union([z.string().url(), z.string().startsWith('/')]);

export const hotelImageInputSchema = z.object({
  url: imageUrl,
  order: z.number().int().min(0).default(0),
});
export type HotelImageInput = z.infer<typeof hotelImageInputSchema>;

export const hotelRoomInputSchema = z.object({
  nameEn: z.string().trim().min(1).max(160),
  nameAr: z.string().trim().min(1).max(160),
  capacity: z.number().int().min(1).default(2),
  pricePerNight: z.number().nonnegative(),
  currency: currencySchema.default('SAR'),
  boardType: z.string().max(20).optional(),
});
export type HotelRoomInput = z.infer<typeof hotelRoomInputSchema>;

export const createHotelSchema = z.object({
  slug: slugField,
  externalId: z.string().max(120).optional(),
  nameEn: z.string().trim().min(2).max(200),
  nameAr: z.string().trim().min(2).max(200),
  descriptionEn: z.string().trim().optional(),
  descriptionAr: z.string().trim().optional(),
  starRating: z.number().int().min(1).max(5).default(5),
  address: z.string().max(300).optional(),
  city: z.string().min(1).max(120),
  country: z.string().min(1).max(120),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  distanceToHaramMeters: z.number().int().min(0).optional(),
  basePricePerNight: z.number().nonnegative().optional(),
  currency: currencySchema.default('SAR'),
  heroImageUrl: imageUrl.optional(),
  amenities: z.array(z.string().max(80)).default([]),
  featured: z.boolean().default(false),
  destinationId: z.string().optional(),
  images: z.array(hotelImageInputSchema).optional(),
  rooms: z.array(hotelRoomInputSchema).optional(),
});
export type CreateHotelInput = z.infer<typeof createHotelSchema>;

export const updateHotelSchema = createHotelSchema.partial();
export type UpdateHotelInput = z.infer<typeof updateHotelSchema>;

export const hotelQuerySchema = paginationQuerySchema.extend({
  city: z.string().optional(),
  featured: booleanQueryParam.optional(),
  starRating: z.coerce.number().int().min(1).max(5).optional(),
  destinationId: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
});
export type HotelQuery = z.infer<typeof hotelQuerySchema>;

export interface HotelRefDto {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
}

export interface HotelImageDto {
  id: string;
  url: string;
  order: number;
}

export interface HotelRoomDto {
  id: string;
  nameEn: string;
  nameAr: string;
  capacity: number;
  pricePerNight: number;
  currency: Currency;
  boardType: string | null;
}

export interface HotelListItemDto {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  starRating: number;
  city: string;
  country: string;
  distanceToHaramMeters: number | null;
  basePricePerNight: number | null;
  currency: Currency;
  heroImageUrl: string | null;
  coverImageUrl: string | null;
  featured: boolean;
  amenities: string[];
  destination: HotelRefDto | null;
}

export interface HotelDetailDto extends HotelListItemDto {
  externalId: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  images: HotelImageDto[];
  rooms: HotelRoomDto[];
  createdAt: string;
  updatedAt: string;
}
