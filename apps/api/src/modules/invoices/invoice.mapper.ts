import type { InvoiceDto } from '@travel/types';
import type { InvoiceRow } from './invoice.repository';

const iso = (value: Date | null): string | null => (value ? value.toISOString() : null);

export function toInvoiceDto(row: InvoiceRow): InvoiceDto {
  return {
    id: row.id,
    number: row.number,
    bookingId: row.bookingId,
    status: row.status,
    currency: row.currency,
    subtotal: Number(row.subtotal),
    taxTotal: Number(row.taxTotal),
    discountTotal: Number(row.discountTotal),
    total: Number(row.total),
    issuedAt: row.issuedAt.toISOString(),
    dueAt: iso(row.dueAt),
    paidAt: iso(row.paidAt),
    billingName: row.billingName,
    billingEmail: row.billingEmail,
    billingAddress: row.billingAddress,
    vatNumber: row.vatNumber,
    pdfUrl: row.pdfUrl,
    items: row.items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      total: Number(item.total),
    })),
    createdAt: row.createdAt.toISOString(),
  };
}
