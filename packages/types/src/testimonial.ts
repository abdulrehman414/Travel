import { z } from 'zod';
import { booleanQueryParam, paginationQuerySchema } from './common';
import { reviewStatusSchema, type ReviewStatus } from './enums';

const imageUrl = z.union([z.string().url(), z.string().startsWith('/')]);

// --------------------------------------------------------------- inputs -----

export const createTestimonialSchema = z.object({
  userId: z.string().optional(),
  authorName: z.string().trim().min(2).max(160),
  authorTitle: z.string().trim().max(160).optional(),
  authorAvatarUrl: imageUrl.optional(),
  country: z.string().trim().max(100).optional(),
  rating: z.number().int().min(1).max(5).default(5),
  quoteEn: z.string().trim().min(3),
  quoteAr: z.string().trim().min(3),
  status: reviewStatusSchema.default('PENDING'),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
});
export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;

export const updateTestimonialSchema = createTestimonialSchema.partial();
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialSchema>;

export const setTestimonialStatusSchema = z.object({ status: reviewStatusSchema });
export type SetTestimonialStatusInput = z.infer<typeof setTestimonialStatusSchema>;

export const testimonialQuerySchema = paginationQuerySchema.extend({
  status: reviewStatusSchema.optional(),
  featured: booleanQueryParam.optional(),
});
export type TestimonialQuery = z.infer<typeof testimonialQuerySchema>;

// -------------------------------------------------------------- outputs -----

export interface TestimonialDto {
  id: string;
  userId: string | null;
  authorName: string;
  authorTitle: string | null;
  authorAvatarUrl: string | null;
  country: string | null;
  rating: number;
  quoteEn: string;
  quoteAr: string;
  status: ReviewStatus;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
