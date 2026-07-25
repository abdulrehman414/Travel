import type { VisaRequestDto } from '@travel/types';
import type { VisaRow } from './visa.repository';

const iso = (value: Date | null): string | null => (value ? value.toISOString() : null);

export function toVisaRequestDto(row: VisaRow): VisaRequestDto {
  return {
    id: row.id,
    reference: row.reference,
    type: row.type,
    status: row.status,
    nationality: row.nationality,
    destinationCountry: row.destinationCountry,
    travelDate: iso(row.travelDate),
    durationDays: row.durationDays,
    applicantFirstName: row.applicantFirstName,
    applicantLastName: row.applicantLastName,
    passportNumber: row.passportNumber,
    passportExpiry: row.passportExpiry.toISOString(),
    gender: row.gender,
    dateOfBirth: iso(row.dateOfBirth),
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    bookingId: row.bookingId,
    fee: row.fee === null ? null : Number(row.fee),
    currency: row.currency,
    notes: row.notes,
    reviewedAt: iso(row.reviewedAt),
    documents: row.documents.map((doc) => ({
      id: doc.id,
      type: doc.type,
      url: doc.url,
      fileName: doc.fileName,
      uploadedAt: doc.uploadedAt.toISOString(),
    })),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
