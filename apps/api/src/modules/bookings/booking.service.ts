import { randomBytes } from 'node:crypto';
import { buildPageMeta } from '@travel/types';
import type {
  AdminBookingQuery,
  BookingDetailDto,
  BookingListItemDto,
  BookingQuery,
  BookingStatus,
  CreateBookingInput,
  Paginated,
  UpdateBookingInput,
} from '@travel/types';
import type { Prisma } from '@travel/db';
import { bookingRepository, type BookingDetailRow } from './booking.repository';
import { round2, toBookingDetail, toBookingListItem } from './booking.mapper';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../lib/api-error';

const REFERENCE_ATTEMPTS = 5;

function generateReference(): string {
  const year = new Date().getFullYear();
  const suffix = randomBytes(3).toString('hex').toUpperCase(); // 6 hex chars
  return `SLT-${year}-${suffix}`;
}

function isUniqueReferenceError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002'
  );
}

/** Seats that consume inventory: adults + children (infants are lap passengers). */
const payingPaxOf = (adults: number, children: number): number => adults + children;

function ensureAccess(row: BookingDetailRow, userId: string, isAdmin: boolean): void {
  if (!isAdmin && row.userId !== userId) {
    throw new NotFoundError('Booking not found');
  }
}

export const bookingService = {
  async create(input: CreateBookingInput, userId: string): Promise<BookingDetailDto> {
    const pkg = await bookingRepository.findPackageForBooking(input.packageId);
    if (!pkg) throw new NotFoundError('Package not found or not available');

    const departure = input.departureId
      ? pkg.departures.find((d) => d.id === input.departureId)
      : undefined;
    if (input.departureId && !departure) {
      throw new BadRequestError('The selected departure does not belong to this package');
    }

    const payingPax = payingPaxOf(input.adults, input.children);
    const unitPrice = Number(departure?.priceOverride ?? pkg.salePrice ?? pkg.basePrice);
    const subtotal = round2(unitPrice * payingPax);
    const vatRate = await bookingRepository.getVatRate();
    const taxTotal = round2(subtotal * vatRate);
    const grandTotal = round2(subtotal + taxTotal);

    const baseData: Omit<Prisma.BookingUncheckedCreateInput, 'reference'> = {
      userId,
      status: 'PENDING',
      currency: pkg.currency,
      subtotal,
      discountTotal: 0,
      taxTotal,
      grandTotal,
      paidTotal: 0,
      adults: input.adults,
      children: input.children,
      infants: input.infants,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      notes: input.notes,
      items: {
        create: [
          {
            type: 'PACKAGE',
            packageId: pkg.id,
            departureId: departure?.id,
            titleSnapshot: pkg.titleEn,
            quantity: payingPax,
            unitPrice,
            totalPrice: subtotal,
            currency: pkg.currency,
            startDate: departure?.departureDate,
            endDate: departure?.returnDate,
          },
        ],
      },
      travelers: {
        create: input.travelers.map((traveler) => ({
          firstName: traveler.firstName,
          lastName: traveler.lastName,
          gender: traveler.gender,
          dateOfBirth: traveler.dateOfBirth,
          nationality: traveler.nationality,
          passportNumber: traveler.passportNumber,
          passportExpiry: traveler.passportExpiry,
          isLead: traveler.isLead,
        })),
      },
    };

    const seat = { departureId: departure?.id, payingPax };

    for (let attempt = 0; attempt < REFERENCE_ATTEMPTS; attempt += 1) {
      try {
        const row = await bookingRepository.createWithSeatReservation(
          { ...baseData, reference: generateReference() },
          seat,
        );
        return toBookingDetail(row);
      } catch (error) {
        if (isUniqueReferenceError(error)) continue; // reference collision — retry
        throw error;
      }
    }
    throw new BadRequestError('Could not generate a unique booking reference, please retry');
  },

  async listOwn(userId: string, query: BookingQuery): Promise<Paginated<BookingListItemDto>> {
    const { rows, total } = await bookingRepository.listByUser(userId, query);
    return { items: rows.map(toBookingListItem), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async listAdmin(query: AdminBookingQuery): Promise<Paginated<BookingListItemDto>> {
    const { rows, total } = await bookingRepository.listAll(query);
    return { items: rows.map(toBookingListItem), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async getOne(id: string, userId: string, isAdmin: boolean): Promise<BookingDetailDto> {
    const row = await bookingRepository.findById(id);
    if (!row) throw new NotFoundError('Booking not found');
    ensureAccess(row, userId, isAdmin);
    return toBookingDetail(row);
  },

  async update(
    id: string,
    userId: string,
    isAdmin: boolean,
    input: UpdateBookingInput,
  ): Promise<BookingDetailDto> {
    const row = await bookingRepository.findById(id);
    if (!row) throw new NotFoundError('Booking not found');
    ensureAccess(row, userId, isAdmin);
    if (!isAdmin && row.status !== 'PENDING') {
      throw new ForbiddenError('Only pending bookings can be modified');
    }
    const updated = await bookingRepository.update(id, {
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      notes: input.notes,
    });
    return toBookingDetail(updated);
  },

  async cancel(
    id: string,
    userId: string,
    isAdmin: boolean,
    reason?: string,
  ): Promise<BookingDetailDto> {
    const row = await bookingRepository.findById(id);
    if (!row) throw new NotFoundError('Booking not found');
    ensureAccess(row, userId, isAdmin);
    if (row.status === 'CANCELLED') {
      throw new BadRequestError('Booking is already cancelled');
    }
    if (row.status === 'COMPLETED') {
      throw new BadRequestError('Completed bookings cannot be cancelled');
    }

    const packageItem = row.items.find((item) => item.type === 'PACKAGE' && item.departureId);
    const restore = {
      departureId: packageItem?.departureId ?? undefined,
      payingPax: payingPaxOf(row.adults, row.children),
    };
    const cancelled = await bookingRepository.cancel(id, reason ?? null, restore);
    return toBookingDetail(cancelled);
  },

  async setStatus(id: string, status: BookingStatus): Promise<BookingDetailDto> {
    const row = await bookingRepository.findById(id);
    if (!row) throw new NotFoundError('Booking not found');
    const updated = await bookingRepository.update(id, { status });
    return toBookingDetail(updated);
  },
};
