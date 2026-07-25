import { z } from 'zod';
import { paginationQuerySchema } from './common';
import { mediaTypeSchema, type MediaType } from './enums';

export const mediaQuerySchema = paginationQuerySchema.extend({
  type: mediaTypeSchema.optional(),
  folder: z.string().optional(),
});
export type MediaQuery = z.infer<typeof mediaQuerySchema>;

export interface MediaDto {
  id: string;
  type: MediaType;
  url: string;
  publicId: string | null;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  folder: string | null;
  altEn: string | null;
  altAr: string | null;
  createdAt: string;
}
