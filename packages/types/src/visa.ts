import { z } from 'zod';
import { paginationQuerySchema } from './common';
import {
  genderSchema,
  visaStatusSchema,
  visaTypeSchema,
  type Currency,
  type Gender,
  type VisaStatus,
  type VisaType,
} from './enums';

const docUrl = z.union([z.string().url(), z.string().startsWith('/')]);

export const createVisaRequestSchema = z.object({
  type: visaTypeSchema,
  nationality: z.string().trim().min(2).max(80),
  destinationCountry: z.string().trim().max(80).default('Saudi Arabia'),
  travelDate: z.coerce.date().optional(),
  durationDays: z.number().int().min(1).max(365).optional(),
  applicantFirstName: z.string().trim().min(1).max(80),
  applicantLastName: z.string().trim().min(1).max(80),
  passportNumber: z.string().trim().min(3).max(40),
  passportExpiry: z.coerce.date(),
  gender: genderSchema.optional(),
  dateOfBirth: z.coerce.date().optional(),
  contactEmail: z.string().trim().toLowerCase().email(),
  contactPhone: z.string().trim().min(6).max(20),
  bookingId: z.string().optional(),
  notes: z.string().max(2000).optional(),
});
export type CreateVisaRequestInput = z.infer<typeof createVisaRequestSchema>;

export const addVisaDocumentSchema = z.object({
  type: z.string().trim().min(1).max(40),
  url: docUrl,
  fileName: z.string().trim().min(1).max(200),
});
export type AddVisaDocumentInput = z.infer<typeof addVisaDocumentSchema>;

export const updateVisaStatusSchema = z.object({
  status: visaStatusSchema,
  notes: z.string().max(2000).optional(),
  fee: z.number().nonnegative().optional(),
});
export type UpdateVisaStatusInput = z.infer<typeof updateVisaStatusSchema>;

export const visaQuerySchema = paginationQuerySchema.extend({
  status: visaStatusSchema.optional(),
  type: visaTypeSchema.optional(),
});
export type VisaQuery = z.infer<typeof visaQuerySchema>;

export interface VisaDocumentDto {
  id: string;
  type: string;
  url: string;
  fileName: string;
  uploadedAt: string;
}

export interface VisaRequestDto {
  id: string;
  reference: string;
  type: VisaType;
  status: VisaStatus;
  nationality: string;
  destinationCountry: string;
  travelDate: string | null;
  durationDays: number | null;
  applicantFirstName: string;
  applicantLastName: string;
  passportNumber: string;
  passportExpiry: string;
  gender: Gender | null;
  dateOfBirth: string | null;
  contactEmail: string;
  contactPhone: string;
  bookingId: string | null;
  fee: number | null;
  currency: Currency;
  notes: string | null;
  reviewedAt: string | null;
  documents: VisaDocumentDto[];
  createdAt: string;
  updatedAt: string;
}
