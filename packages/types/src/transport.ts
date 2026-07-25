import { z } from 'zod';
import { booleanQueryParam, paginationQuerySchema } from './common';
import { currencySchema, type Currency } from './enums';

export const transportTypeSchema = z.enum([
  'AIRPORT_TRANSFER',
  'INTERCITY',
  'ZIYARAT',
  'HOURLY',
  'CITY_TOUR',
]);
export type TransportType = z.infer<typeof transportTypeSchema>;

export const vehicleClassSchema = z.enum(['SEDAN', 'SUV', 'VAN', 'BUS', 'LUXURY']);
export type VehicleClass = z.infer<typeof vehicleClassSchema>;

export const pricingUnitSchema = z.enum(['per_trip', 'per_hour', 'per_day']);
export type PricingUnit = z.infer<typeof pricingUnitSchema>;

const slugField = z
  .string()
  .min(3)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug');
const imageUrl = z.union([z.string().url(), z.string().startsWith('/')]);

export const createTransportSchema = z.object({
  slug: slugField,
  type: transportTypeSchema,
  vehicleClass: vehicleClassSchema,
  titleEn: z.string().trim().min(2).max(200),
  titleAr: z.string().trim().min(2).max(200),
  descriptionEn: z.string().trim().min(3),
  descriptionAr: z.string().trim().min(3),
  fromCity: z.string().max(120).optional(),
  toCity: z.string().max(120).optional(),
  city: z.string().max(120).optional(),
  durationHours: z.number().int().min(1).max(48).optional(),
  capacity: z.number().int().min(1).max(60).default(4),
  basePrice: z.number().nonnegative(),
  currency: currencySchema.default('SAR'),
  pricingUnit: pricingUnitSchema.default('per_trip'),
  imageUrl: imageUrl.optional(),
  featuresEn: z.array(z.string().max(80)).default([]),
  featuresAr: z.array(z.string().max(80)).default([]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});
export type CreateTransportInput = z.infer<typeof createTransportSchema>;

export const updateTransportSchema = createTransportSchema.partial();
export type UpdateTransportInput = z.infer<typeof updateTransportSchema>;

export const transportQuerySchema = paginationQuerySchema.extend({
  type: transportTypeSchema.optional(),
  vehicleClass: vehicleClassSchema.optional(),
  city: z.string().optional(),
  featured: booleanQueryParam.optional(),
});
export type TransportQuery = z.infer<typeof transportQuerySchema>;

export interface TransportServiceDto {
  id: string;
  slug: string;
  type: TransportType;
  vehicleClass: VehicleClass;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  fromCity: string | null;
  toCity: string | null;
  city: string | null;
  durationHours: number | null;
  capacity: number;
  basePrice: number;
  currency: Currency;
  pricingUnit: string;
  imageUrl: string | null;
  featuresEn: string[];
  featuresAr: string[];
  featured: boolean;
  active: boolean;
  createdAt: string;
}
