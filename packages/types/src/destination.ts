import { z } from 'zod';
import { booleanQueryParam, paginationQuerySchema } from './common';

const slugField = z
  .string()
  .min(3)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug');

const imageUrl = z.union([z.string().url(), z.string().startsWith('/')]);

// --------------------------------------------------------------- inputs -----

export const createDestinationSchema = z.object({
  slug: slugField,
  nameEn: z.string().trim().min(2).max(160),
  nameAr: z.string().trim().min(2).max(160),
  descriptionEn: z.string().trim().min(1).optional(),
  descriptionAr: z.string().trim().min(1).optional(),
  country: z.string().trim().min(2).max(120),
  city: z.string().trim().max(120).optional(),
  region: z.string().trim().max(120).optional(),
  isDomestic: z.boolean().default(true),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  heroImageUrl: imageUrl.optional(),
  featured: z.boolean().default(false),
});
export type CreateDestinationInput = z.infer<typeof createDestinationSchema>;

export const updateDestinationSchema = createDestinationSchema.partial();
export type UpdateDestinationInput = z.infer<typeof updateDestinationSchema>;

export const destinationQuerySchema = paginationQuerySchema.extend({
  featured: booleanQueryParam.optional(),
  country: z.string().trim().max(120).optional(),
  isDomestic: booleanQueryParam.optional(),
});
export type DestinationQuery = z.infer<typeof destinationQuerySchema>;

// -------------------------------------------------------------- outputs -----

export interface DestinationListItemDto {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  country: string;
  city: string | null;
  region: string | null;
  isDomestic: boolean;
  latitude: number | null;
  longitude: number | null;
  heroImageUrl: string | null;
  featured: boolean;
}

export interface DestinationDetailDto extends DestinationListItemDto {
  descriptionEn: string | null;
  descriptionAr: string | null;
  createdAt: string;
  updatedAt: string;
}
