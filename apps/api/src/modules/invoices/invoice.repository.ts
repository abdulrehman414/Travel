import { prisma, type Prisma } from '@travel/db';
import type { InvoiceQuery } from '@travel/types';

const invoiceInclude = {
  items: true,
} satisfies Prisma.InvoiceInclude;

export type InvoiceRow = Prisma.InvoiceGetPayload<{ include: typeof invoiceInclude }>;

const bookingForInvoice = {
  items: { orderBy: { createdAt: 'asc' } },
  user: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.BookingInclude;

export type BookingForInvoice = Prisma.BookingGetPayload<{ include: typeof bookingForInvoice }>;

export const invoiceRepository = {
  findBookingForInvoice(bookingId: string): Promise<BookingForInvoice | null> {
    return prisma.booking.findUnique({ where: { id: bookingId }, include: bookingForInvoice });
  },

  findByBookingId(bookingId: string): Promise<InvoiceRow | null> {
    return prisma.invoice.findUnique({ where: { bookingId }, include: invoiceInclude });
  },

  findById(id: string): Promise<InvoiceRow | null> {
    return prisma.invoice.findUnique({ where: { id }, include: invoiceInclude });
  },

  /** Invoice + owning user id, for ownership checks on download endpoints. */
  findByIdWithOwner(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      include: { items: true, booking: { select: { userId: true, reference: true } } },
    });
  },

  create(data: Prisma.InvoiceUncheckedCreateInput): Promise<InvoiceRow> {
    return prisma.invoice.create({ data, include: invoiceInclude });
  },

  update(id: string, data: Prisma.InvoiceUncheckedUpdateInput): Promise<InvoiceRow> {
    return prisma.invoice.update({ where: { id }, data, include: invoiceInclude });
  },

  async list(query: InvoiceQuery): Promise<{ rows: InvoiceRow[]; total: number }> {
    const where: Prisma.InvoiceWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.search) where.number = { contains: query.search, mode: 'insensitive' };
    const skip = (query.page - 1) * query.limit;
    const [rows, total] = await prisma.$transaction([
      prisma.invoice.findMany({
        where,
        include: invoiceInclude,
        orderBy: { issuedAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.invoice.count({ where }),
    ]);
    return { rows, total };
  },
};
