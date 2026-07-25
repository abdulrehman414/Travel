import { z } from 'zod';
import { paginationQuerySchema } from './common';
import { postStatusSchema, type PostStatus } from './enums';

const slugField = z
  .string()
  .min(3)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug');
const imageUrl = z.union([z.string().url(), z.string().startsWith('/')]);

export const createPostSchema = z.object({
  slug: slugField,
  status: postStatusSchema.default('DRAFT'),
  titleEn: z.string().trim().min(3).max(200),
  titleAr: z.string().trim().min(3).max(200),
  excerptEn: z.string().trim().min(3).max(600),
  excerptAr: z.string().trim().min(3).max(600),
  contentEn: z.string().trim().min(3),
  contentAr: z.string().trim().min(3),
  coverImageUrl: imageUrl.optional(),
  readMinutes: z.number().int().min(1).max(120).default(5),
  categoryId: z.string().optional(),
  metaTitleEn: z.string().max(200).optional(),
  metaTitleAr: z.string().max(200).optional(),
  metaDescriptionEn: z.string().max(320).optional(),
  metaDescriptionAr: z.string().max(320).optional(),
  tagIds: z.array(z.string()).optional(),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;

export const updatePostSchema = createPostSchema.partial();
export type UpdatePostInput = z.infer<typeof updatePostSchema>;

export const setPostStatusSchema = z.object({ status: postStatusSchema });
export type SetPostStatusInput = z.infer<typeof setPostStatusSchema>;

export const postQuerySchema = paginationQuerySchema.extend({
  status: postStatusSchema.optional(),
  categoryId: z.string().optional(),
  tag: z.string().optional(),
});
export type PostQuery = z.infer<typeof postQuerySchema>;

export interface PostAuthorDto {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface PostRefDto {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
}

export interface PostListItemDto {
  id: string;
  slug: string;
  status: PostStatus;
  titleEn: string;
  titleAr: string;
  excerptEn: string;
  excerptAr: string;
  coverImageUrl: string | null;
  readMinutes: number;
  views: number;
  author: PostAuthorDto | null;
  category: PostRefDto | null;
  tags: PostRefDto[];
  publishedAt: string | null;
  createdAt: string;
}

export interface PostDetailDto extends PostListItemDto {
  contentEn: string;
  contentAr: string;
  metaTitleEn: string | null;
  metaTitleAr: string | null;
  metaDescriptionEn: string | null;
  metaDescriptionAr: string | null;
  updatedAt: string;
}
