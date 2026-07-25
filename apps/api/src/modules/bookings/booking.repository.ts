import { prisma, type Prisma } from '@travel/db';
import type { AdminBookingQuery, BookingQuery } from '@travel/types';
import { ConflictError } from '../../lib/api-error';

const detailInclude = {
  items: { orderBy: { createdAt: 'asc' } },
  travelers: true,
} satisfies Prisma.BookingInclude;

export type BookingDetailRow = Prisma.BookingGetPayload<{ include: typeof detailInclude }>;

export interface SeatReservation {
  departureId?: string;
  payingPax: number;
}

export const bookingRepository = {
  /** Published package + its departures, for building & pricing a booking. */
  findPackageForBooking(packageId: string) {
    return prisma.package.findFirst({
      where: { id: packageId, status: 'PUBLISHED', deletedAt: null },
      include: { departures: true },
    });
  },

  async getVatRate(): Promise<number> {
    const setting = await prisma.setting.findUnique({ where: { key: 'booking.vatRate' } });
    const value = setting?.value;
    return typeof value === 'number' && value >= 0 && value < 1 ? value : 0.15;
  },

  /**
   * Creates a booking, atomically reserving departure seats in the same
   * transaction. The guarded UPDATE only succeeds when enough seats remain,
   * making concurrent bookings race-safe.
   */
  async createWithSeatReservation(
    data: Prisma.BookingUncheckedCreateInput,
    seat: SeatReservation,
  ): Promise<BookingDetailRow> {
    return prisma.$transaction(async (tx) => {
      if (seat.departureId) {
        const reserved = await tx.$executeRaw`
          UPDATE "PackageDeparture"
          SET "bookedSeats" = "bookedSeats" + ${seat.payingPax}
          WHERE "id" = ${seat.departureId}
            AND "status" IN ('OPEN', 'SCHEDULED')
            AND "bookedSeats" + ${seat.payingPax} <= "totalSeats"`;
        if (reserved === 0) {
          throw new ConflictError('Not enough seats available for the selected departure');
        }
      }
      return tx.booking.create({ data, include: detailInclude });
    });
  },

  async listByUser(
    userId: string,
    query: BookingQuery,
  ): Promise<{ rows: BookingDetailRow[]; total: number }> {
    const where: Prisma.BookingWhereInput = { userId };
    if (query.status) where.status = query.status;
    const skip = (query.page - 1) * query.limit;
    const [rows, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where,
        include: detailInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.booking.count({ where }),
    ]);
    return { rows, total };
  },

  async listAll(query: AdminBookingQuery): Promise<{ rows: BookingDetailRow[]; total: number }> {
    const where: Prisma.BookingWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.userId) where.userId = query.userId;
    if (query.search) {
      where.OR = [
        { reference: { contains: query.search, mode: 'insensitive' } },
        { contactEmail: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const skip = (query.page - 1) * query.limit;
    const [rows, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where,
        include: detailInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.booking.count({ where }),
    ]);
    return { rows, total };
  },

  findById(id: string): Promise<BookingDetailRow | null> {
    return prisma.booking.findUnique({ where: { id }, include: detailInclude });
  },

  update(id: string, data: Prisma.BookingUncheckedUpdateInput): Promise<BookingDetailRow> {
    return prisma.booking.update({ where: { id }, data, include: detailInclude });
  },

  /** Cancels a booking and restores any reserved departure seats. */
  async cancel(
    id: string,
    reason: string | null,
    restore: SeatReservation,
  ): Promise<BookingDetailRow> {
    return prisma.$transaction(async (tx) => {
      if (restore.departureId) {
        await tx.$executeRaw`
          UPDATE "PackageDeparture"
          SET "bookedSeats" = GREATEST(0, "bookedSeats" - ${restore.payingPax})
          WHERE "id" = ${restore.departureId}`;
      }
      return tx.booking.update({
        where: { id },
        data: { status: 'CANCELLED', cancelledAt: new Date(), cancellationReason: reason },
        include: detailInclude,
      });
    });
  },
};
