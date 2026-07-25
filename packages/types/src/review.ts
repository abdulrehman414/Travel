import { z } from 'zod';
import { paginationQuerySchema } from './common';
import { reviewStatusSchema, type ReviewStatus } from './enums';

export const createReviewSchema = z.object({
  packageId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  titleEn: z.string().max(160).optional(),
  comment: z.string().trim().min(3).max(2000),
});
export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const setReviewStatusSchema = z.object({ status: reviewStatusSchema });
export type SetReviewStatusInput = z.infer<typeof setReviewStatusSchema>;

export const publicReviewQuerySchema = paginationQuerySchema.extend({
  packageId: z.string().min(1),
});
export type PublicReviewQuery = z.infer<typeof publicReviewQuerySchema>;

export const adminReviewQuerySchema = paginationQuerySchema.extend({
  status: reviewStatusSchema.optional(),
  packageId: z.string().optional(),
});
export type AdminReviewQuery = z.infer<typeof adminReviewQuerySchema>;

export interface ReviewUserDto {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface ReviewPackageDto {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
}

export interface ReviewDto {
  id: string;
  rating: number;
  titleEn: string | null;
  comment: string;
  status: ReviewStatus;
  user: ReviewUserDto | null;
  package: ReviewPackageDto | null;
  createdAt: string;
  updatedAt: string;
}
