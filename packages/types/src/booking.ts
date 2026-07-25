import { z } from 'zod';
import { paginationQuerySchema } from './common';
import {
  bookingStatusSchema,
  genderSchema,
  type BookingItemType,
  type BookingStatus,
  type Currency,
  type Gender,
} from './enums';

export const travelerInputSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  gender: genderSchema.optional(),
  dateOfBirth: z.coerce.date().optional(),
  nationality: z.string().max(80).optional(),
  passportNumber: z.string().max(40).optional(),
  passportExpiry: z.coerce.date().optional(),
  isLead: z.boolean().default(false),
});
export type TravelerInput = z.infer<typeof travelerInputSchema>;

export const createBookingSchema = z.object({
  packageId: z.string().min(1),
  departureId: z.string().min(1).optional(),
  adults: z.number().int().min(1).max(50).default(1),
  children: z.number().int().min(0).max(50).default(0),
  infants: z.number().int().min(0).max(50).default(0),
  contactEmail: z.string().trim().toLowerCase().email(),
  contactPhone: z.string().trim().min(6).max(20),
  notes: z.string().max(2000).optional(),
  travelers: z.array(travelerInputSchema).min(1, 'At least one traveler is required'),
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const updateBookingSchema = z.object({
  contactEmail: z.string().trim().toLowerCase().email().optional(),
  contactPhone: z.string().trim().min(6).max(20).optional(),
  notes: z.string().max(2000).optional(),
});
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;

export const cancelBookingSchema = z.object({
  reason: z.string().max(500).optional(),
});
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;

export const setBookingStatusSchema = z.object({ status: bookingStatusSchema });
export type SetBookingStatusInput = z.infer<typeof setBookingStatusSchema>;

export const bookingQuerySchema = paginationQuerySchema.extend({
  status: bookingStatusSchema.optional(),
});
export type BookingQuery = z.infer<typeof bookingQuerySchema>;

export const adminBookingQuerySchema = paginationQuerySchema.extend({
  status: bookingStatusSchema.optional(),
  userId: z.string().optional(),
});
export type AdminBookingQuery = z.infer<typeof adminBookingQuerySchema>;

export interface BookingItemDto {
  id: string;
  type: BookingItemType;
  titleSnapshot: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: Currency;
  startDate: string | null;
  endDate: string | null;
}

export interface TravelerDto {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender | null;
  dateOfBirth: string | null;
  nationality: string | null;
  isLead: boolean;
}

export interface BookingListItemDto {
  id: string;
  reference: string;
  status: BookingStatus;
  currency: Currency;
  grandTotal: number;
  paidTotal: number;
  adults: number;
  children: number;
  infants: number;
  createdAt: string;
}

export interface BookingDetailDto extends BookingListItemDto {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  contactEmail: string;
  contactPhone: string;
  notes: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  items: BookingItemDto[];
  travelers: TravelerDto[];
  updatedAt: string;
}
