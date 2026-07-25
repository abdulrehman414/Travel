import { z } from 'zod';
import { paginationQuerySchema } from './common';
import { categoryKindSchema, type CategoryKind } from './enums';

const slugField = z
  .string()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug');

const imageUrl = z.union([z.string().url(), z.string().startsWith('/')]);

// --------------------------------------------------------------- inputs -----

export const createCategorySchema = z.object({
  kind: categoryKindSchema,
  slug: slugField,
  nameEn: z.string().trim().min(1).max(160),
  nameAr: z.string().trim().min(1).max(160),
  descriptionEn: z.string().trim().min(1).optional(),
  descriptionAr: z.string().trim().min(1).optional(),
  imageUrl: imageUrl.optional(),
  parentId: z.string().optional(),
  order: z.number().int().min(0).default(0),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial();
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export const categoryQuerySchema = paginationQuerySchema.extend({
  kind: categoryKindSchema.optional(),
  parentId: z.string().optional(),
});
export type CategoryQuery = z.infer<typeof categoryQuerySchema>;

// -------------------------------------------------------------- outputs -----

export interface CategoryRefDto {
  id: string;
  kind: CategoryKind;
  slug: string;
  nameEn: string;
  nameAr: string;
}

export interface CategoryDto {
  id: string;
  kind: CategoryKind;
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  imageUrl: string | null;
  parentId: string | null;
  order: number;
  parent: CategoryRefDto | null;
  childrenCount: number;
  createdAt: string;
  updatedAt: string;
}
