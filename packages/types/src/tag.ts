import { z } from 'zod';
import { paginationQuerySchema } from './common';

const slugField = z
  .string()
  .min(3)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug');

// --------------------------------------------------------------- inputs -----

export const createTagSchema = z.object({
  slug: slugField,
  nameEn: z.string().trim().min(1).max(120),
  nameAr: z.string().trim().min(1).max(120),
});
export type CreateTagInput = z.infer<typeof createTagSchema>;

export const updateTagSchema = createTagSchema.partial();
export type UpdateTagInput = z.infer<typeof updateTagSchema>;

// No tag-specific filters beyond the shared pagination + search params.
export const tagQuerySchema = paginationQuerySchema;
export type TagQuery = z.infer<typeof tagQuerySchema>;

// -------------------------------------------------------------- outputs -----

export interface TagDto {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  createdAt: string;
}
