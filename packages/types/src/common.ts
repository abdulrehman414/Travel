import { z } from 'zod';

/** Standard API envelope returned by every backend endpoint. */
export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiFieldError {
  path: string;
  message: string;
}

export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: ApiFieldError[];
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/** Pagination metadata attached to list responses. */
export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}

export const sortOrderSchema = z.enum(['asc', 'desc']);
export type SortOrder = z.infer<typeof sortOrderSchema>;

/** Coerces query-string booleans correctly ("false" → false, unlike z.coerce.boolean). */
export const booleanQueryParam = z.preprocess((value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['true', '1', 'yes'].includes(value.toLowerCase());
  return value;
}, z.boolean());

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  sort: z.string().trim().max(60).optional(),
  order: sortOrderSchema.default('desc'),
  search: z.string().trim().max(120).optional(),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const idParamSchema = z.object({
  id: z.string().min(1, 'id is required'),
});
export type IdParam = z.infer<typeof idParamSchema>;

export const slugParamSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug'),
});
export type SlugParam = z.infer<typeof slugParamSchema>;

/** Helper to compute pagination metadata from totals. */
export function buildPageMeta(total: number, page: number, limit: number): PageMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
