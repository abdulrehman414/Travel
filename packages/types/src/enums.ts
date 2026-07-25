import { z } from 'zod';

/**
 * Domain enums. These mirror the Prisma enums exactly (same string values) but
 * are defined independently here so this package stays browser-safe and free of
 * any Prisma/server dependency. Backend code interoperates freely because both
 * sides are identical string-literal unions.
 */

export const userStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']);
export type UserStatus = z.infer<typeof userStatusSchema>;

export const genderSchema = z.enum(['MALE', 'FEMALE', 'OTHER']);
export type Gender = z.infer<typeof genderSchema>;

export const packageTypeSchema = z.enum([
  'HAJJ',
  'UMRAH',
  'DOMESTIC_TOUR',
  'INTERNATIONAL_TOUR',
  'CORPORATE',
  'TRANSPORT',
]);
export type PackageType = z.infer<typeof packageTypeSchema>;

export const packageStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export type PackageStatus = z.infer<typeof packageStatusSchema>;

export const inclusionTypeSchema = z.enum(['INCLUDED', 'EXCLUDED']);
export type InclusionType = z.infer<typeof inclusionTypeSchema>;

export const departureStatusSchema = z.enum([
  'SCHEDULED',
  'OPEN',
  'CLOSED',
  'SOLD_OUT',
  'CANCELLED',
]);
export type DepartureStatus = z.infer<typeof departureStatusSchema>;

export const categoryKindSchema = z.enum(['PACKAGE', 'BLOG', 'DESTINATION']);
export type CategoryKind = z.infer<typeof categoryKindSchema>;

export const bookingStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'PARTIALLY_PAID',
  'PAID',
  'CANCELLED',
  'COMPLETED',
  'REFUNDED',
]);
export type BookingStatus = z.infer<typeof bookingStatusSchema>;

export const bookingItemTypeSchema = z.enum([
  'PACKAGE',
  'HOTEL',
  'FLIGHT',
  'VISA',
  'TRANSPORT',
]);
export type BookingItemType = z.infer<typeof bookingItemTypeSchema>;

export const paymentProviderSchema = z.enum(['STRIPE', 'HYPERPAY', 'PAYTABS', 'MANUAL']);
export type PaymentProvider = z.infer<typeof paymentProviderSchema>;

export const paymentStatusSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'PAID',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
]);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const paymentMethodSchema = z.enum([
  'CARD',
  'MADA',
  'APPLE_PAY',
  'STC_PAY',
  'BANK_TRANSFER',
]);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const refundStatusSchema = z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']);
export type RefundStatus = z.infer<typeof refundStatusSchema>;

export const invoiceStatusSchema = z.enum(['DRAFT', 'ISSUED', 'PAID', 'VOID', 'REFUNDED']);
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;

export const visaTypeSchema = z.enum([
  'TOURIST',
  'UMRAH',
  'HAJJ',
  'BUSINESS',
  'TRANSIT',
  'WORK',
  'FAMILY',
]);
export type VisaType = z.infer<typeof visaTypeSchema>;

export const visaStatusSchema = z.enum([
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'ADDITIONAL_INFO',
  'APPROVED',
  'REJECTED',
  'ISSUED',
  'CANCELLED',
]);
export type VisaStatus = z.infer<typeof visaStatusSchema>;

export const reviewStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);
export type ReviewStatus = z.infer<typeof reviewStatusSchema>;

export const postStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export type PostStatus = z.infer<typeof postStatusSchema>;

export const notificationTypeSchema = z.enum([
  'BOOKING',
  'PAYMENT',
  'VISA',
  'SYSTEM',
  'PROMOTION',
  'REVIEW',
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const notificationChannelSchema = z.enum(['IN_APP', 'EMAIL', 'WHATSAPP', 'SMS']);
export type NotificationChannel = z.infer<typeof notificationChannelSchema>;

export const mediaTypeSchema = z.enum(['IMAGE', 'VIDEO', 'DOCUMENT']);
export type MediaType = z.infer<typeof mediaTypeSchema>;

export const currencySchema = z.enum(['SAR', 'USD', 'EUR', 'GBP', 'AED']);
export type Currency = z.infer<typeof currencySchema>;

export const contactStatusSchema = z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED', 'SPAM']);
export type ContactStatus = z.infer<typeof contactStatusSchema>;

export const localeSchema = z.enum(['en', 'ar']);
export type Locale = z.infer<typeof localeSchema>;
