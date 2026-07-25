import type { PaymentDto, RefundDto } from '@travel/types';
import type { PaymentRow } from './payment.repository';

const iso = (value: Date | null): string | null => (value ? value.toISOString() : null);

function toRefund(refund: PaymentRow['refunds'][number]): RefundDto {
  return {
    id: refund.id,
    amount: Number(refund.amount),
    currency: refund.currency,
    status: refund.status,
    reason: refund.reason,
    providerRef: refund.providerRef,
    createdAt: refund.createdAt.toISOString(),
    processedAt: iso(refund.processedAt),
  };
}

export function toPaymentDto(row: PaymentRow): PaymentDto {
  return {
    id: row.id,
    bookingId: row.bookingId,
    provider: row.provider,
    method: row.method,
    status: row.status,
    amount: Number(row.amount),
    currency: row.currency,
    providerRef: row.providerRef,
    paidAt: iso(row.paidAt),
    failureReason: row.failureReason,
    createdAt: row.createdAt.toISOString(),
    refunds: row.refunds.map(toRefund),
  };
}
