import { z } from 'zod';
import { booleanQueryParam, paginationQuerySchema } from './common';

// --------------------------------------------------------------- inputs -----

export const createFaqSchema = z.object({
  category: z.string().trim().min(1).max(100).default('general'),
  questionEn: z.string().trim().min(1).max(500),
  questionAr: z.string().trim().min(1).max(500),
  answerEn: z.string().trim().min(1),
  answerAr: z.string().trim().min(1),
  order: z.number().int().min(0).default(0),
  published: z.boolean().default(true),
});
export type CreateFaqInput = z.infer<typeof createFaqSchema>;

export const updateFaqSchema = createFaqSchema.partial();
export type UpdateFaqInput = z.infer<typeof updateFaqSchema>;

export const faqQuerySchema = paginationQuerySchema.extend({
  category: z.string().trim().max(100).optional(),
  published: booleanQueryParam.optional(),
});
export type FaqQuery = z.infer<typeof faqQuerySchema>;

// -------------------------------------------------------------- outputs -----

export interface FaqDto {
  id: string;
  category: string;
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
  order: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}
