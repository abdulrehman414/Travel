import { z } from 'zod';
import { paginationQuerySchema } from './common';
import {
  paymentMethodSchema,
  paymentProviderSchema,
  paymentStatusSchema,
  type Currency,
  type PaymentMethod,
  type PaymentProvider,
  type PaymentStatus,
  type RefundStatus,
} from './enums';

export const initiatePaymentSchema = z.object({
  bookingId: z.string().min(1),
  provider: paymentProviderSchema.default('STRIPE'),
  method: paymentMethodSchema.optional(),
});
export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;

export const refundPaymentSchema = z.object({
  amount: z.number().positive().optional(),
  reason: z.string().max(500).optional(),
});
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;

export const paymentQuerySchema = paginationQuerySchema.extend({
  status: paymentStatusSchema.optional(),
  provider: paymentProviderSchema.optional(),
  bookingId: z.string().optional(),
});
export type PaymentQuery = z.infer<typeof paymentQuerySchema>;

export interface CheckoutDto {
  paymentId: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  checkoutId: string | null;
  redirectUrl: string | null;
  clientSecret: string | null;
  mode: 'live' | 'mock';
}

export interface RefundDto {
  id: string;
  amount: number;
  currency: Currency;
  status: RefundStatus;
  reason: string | null;
  providerRef: string | null;
  createdAt: string;
  processedAt: string | null;
}

export interface PaymentDto {
  id: string;
  bookingId: string;
  provider: PaymentProvider;
  method: PaymentMethod | null;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  providerRef: string | null;
  paidAt: string | null;
  failureReason: string | null;
  createdAt: string;
  refunds: RefundDto[];
}
