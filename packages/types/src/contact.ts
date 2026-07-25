import { z } from 'zod';
import { paginationQuerySchema } from './common';
import { contactStatusSchema, type ContactStatus } from './enums';

export const createContactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().max(20).optional(),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(5).max(5000),
});
export type CreateContactInput = z.infer<typeof createContactSchema>;

export const updateContactStatusSchema = z.object({ status: contactStatusSchema });
export type UpdateContactStatusInput = z.infer<typeof updateContactStatusSchema>;

export const contactQuerySchema = paginationQuerySchema.extend({
  status: contactStatusSchema.optional(),
});
export type ContactQuery = z.infer<typeof contactQuerySchema>;

export interface ContactMessageDto {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
}
