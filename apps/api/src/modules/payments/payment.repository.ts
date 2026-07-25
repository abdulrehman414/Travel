import { prisma, type Prisma } from '@travel/db';
import type { PaymentQuery } from '@travel/types';

const paymentInclude = {
  refunds: { orderBy: { createdAt: 'desc' } },
} satisfies Prisma.PaymentInclude;

export type PaymentRow = Prisma.PaymentGetPayload<{ include: typeof paymentInclude }>;

export const paymentRepository = {
  create(data: Prisma.PaymentUncheckedCreateInput): Promise<PaymentRow> {
    return prisma.payment.create({ data, include: paymentInclude });
  },

  findById(id: string): Promise<PaymentRow | null> {
    return prisma.payment.findUnique({ where: { id }, include: paymentInclude });
  },

  findByProviderRef(provider: Prisma.PaymentWhereInput['provider'], ref: string): Promise<PaymentRow | null> {
    return prisma.payment.findFirst({
      where: { provider, OR: [{ providerCheckoutId: ref }, { providerRef: ref }] },
      include: paymentInclude,
    });
  },

  update(id: string, data: Prisma.PaymentUncheckedUpdateInput): Promise<PaymentRow> {
    return prisma.payment.update({ where: { id }, data, include: paymentInclude });
  },

  listByBooking(bookingId: string): Promise<PaymentRow[]> {
    return prisma.payment.findMany({
      where: { bookingId },
      include: paymentInclude,
      orderBy: { createdAt: 'desc' },
    });
  },

  async list(query: PaymentQuery): Promise<{ rows: PaymentRow[]; total: number }> {
    const where: Prisma.PaymentWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.provider) where.provider = query.provider;
    if (query.bookingId) where.bookingId = query.bookingId;
    const skip = (query.page - 1) * query.limit;
    const [rows, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where,
        include: paymentInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.payment.count({ where }),
    ]);
    return { rows, total };
  },

  createRefund(data: Prisma.RefundUncheckedCreateInput): Promise<unknown> {
    return prisma.refund.create({ data });
  },

  /** Applies a successful payment to its booking (idempotent on paidTotal). */
  async settleBooking(bookingId: string): Promise<void> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });
    if (!booking) return;
    const paidTotal = booking.payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const grand = Number(booking.grandTotal);
    const status = paidTotal >= grand ? 'PAID' : paidTotal > 0 ? 'PARTIALLY_PAID' : booking.status;
    await prisma.booking.update({
      where: { id: bookingId },
      data: { paidTotal, status },
    });
  },
};
