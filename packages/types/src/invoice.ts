import { z } from 'zod';
import { paginationQuerySchema } from './common';
import { invoiceStatusSchema, type Currency, type InvoiceStatus } from './enums';

export const generateInvoiceSchema = z.object({
  bookingId: z.string().min(1),
});
export type GenerateInvoiceInput = z.infer<typeof generateInvoiceSchema>;

export const invoiceQuerySchema = paginationQuerySchema.extend({
  status: invoiceStatusSchema.optional(),
});
export type InvoiceQuery = z.infer<typeof invoiceQuerySchema>;

export interface InvoiceItemDto {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceDto {
  id: string;
  number: string;
  bookingId: string;
  status: InvoiceStatus;
  currency: Currency;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  issuedAt: string;
  dueAt: string | null;
  paidAt: string | null;
  billingName: string;
  billingEmail: string;
  billingAddress: string | null;
  vatNumber: string | null;
  pdfUrl: string | null;
  items: InvoiceItemDto[];
  createdAt: string;
}
