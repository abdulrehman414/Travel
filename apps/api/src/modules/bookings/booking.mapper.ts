import type {
  BookingDetailDto,
  BookingItemDto,
  BookingListItemDto,
  TravelerDto,
} from '@travel/types';
import type { BookingDetailRow } from './booking.repository';

const iso = (value: Date | null): string | null => (value ? value.toISOString() : null);

function toItem(item: BookingDetailRow['items'][number]): BookingItemDto {
  return {
    id: item.id,
    type: item.type,
    titleSnapshot: item.titleSnapshot,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    totalPrice: Number(item.totalPrice),
    currency: item.currency,
    startDate: iso(item.startDate),
    endDate: iso(item.endDate),
  };
}

function toTraveler(traveler: BookingDetailRow['travelers'][number]): TravelerDto {
  return {
    id: traveler.id,
    firstName: traveler.firstName,
    lastName: traveler.lastName,
    gender: traveler.gender,
    dateOfBirth: iso(traveler.dateOfBirth),
    nationality: traveler.nationality,
    isLead: traveler.isLead,
  };
}

export function toBookingListItem(row: BookingDetailRow): BookingListItemDto {
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    currency: row.currency,
    grandTotal: Number(row.grandTotal),
    paidTotal: Number(row.paidTotal),
    adults: row.adults,
    children: row.children,
    infants: row.infants,
    createdAt: row.createdAt.toISOString(),
  };
}

export function toBookingDetail(row: BookingDetailRow): BookingDetailDto {
  return {
    ...toBookingListItem(row),
    subtotal: Number(row.subtotal),
    discountTotal: Number(row.discountTotal),
    taxTotal: Number(row.taxTotal),
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    notes: row.notes,
    cancelledAt: iso(row.cancelledAt),
    cancellationReason: row.cancellationReason,
    items: row.items.map(toItem),
    travelers: row.travelers.map(toTraveler),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Shared money helper used by the service when rounding computed totals. */
export const round2 = (value: number): number => Math.round(value * 100) / 100;
