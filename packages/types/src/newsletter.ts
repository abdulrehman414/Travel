import { z } from 'zod';
import { booleanQueryParam, paginationQuerySchema } from './common';
import { localeSchema } from './enums';

export const subscribeNewsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  locale: localeSchema.default('en'),
});
export type SubscribeNewsletterInput = z.infer<typeof subscribeNewsletterSchema>;

export const unsubscribeNewsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});
export type UnsubscribeNewsletterInput = z.infer<typeof unsubscribeNewsletterSchema>;

export const newsletterQuerySchema = paginationQuerySchema.extend({
  confirmed: booleanQueryParam.optional(),
});
export type NewsletterQuery = z.infer<typeof newsletterQuerySchema>;

export interface NewsletterSubscriberDto {
  id: string;
  email: string;
  locale: string;
  confirmed: boolean;
  unsubscribedAt: string | null;
  createdAt: string;
}
