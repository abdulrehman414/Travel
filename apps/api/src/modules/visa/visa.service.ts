import { randomBytes } from 'node:crypto';
import { buildPageMeta } from '@travel/types';
import type {
  AddVisaDocumentInput,
  CreateVisaRequestInput,
  Paginated,
  UpdateVisaStatusInput,
  VisaQuery,
  VisaRequestDto,
} from '@travel/types';
import { visaRepository } from './visa.repository';
import { toVisaRequestDto } from './visa.mapper';
import { BadRequestError, NotFoundError } from '../../lib/api-error';

const REFERENCE_ATTEMPTS = 5;

function generateReference(): string {
  return `VSA-${new Date().getFullYear()}-${randomBytes(3).toString('hex').toUpperCase()}`;
}

function isUniqueReferenceError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002'
  );
}

function assertAccess(ownerId: string, userId: string, isAdmin: boolean): void {
  if (!isAdmin && ownerId !== userId) throw new NotFoundError('Visa request not found');
}

export const visaService = {
  async create(input: CreateVisaRequestInput, userId: string): Promise<VisaRequestDto> {
    for (let attempt = 0; attempt < REFERENCE_ATTEMPTS; attempt += 1) {
      try {
        const row = await visaRepository.create({
          reference: generateReference(),
          userId,
          bookingId: input.bookingId,
          type: input.type,
          status: 'SUBMITTED',
          nationality: input.nationality,
          destinationCountry: input.destinationCountry,
          travelDate: input.travelDate,
          durationDays: input.durationDays,
          applicantFirstName: input.applicantFirstName,
          applicantLastName: input.applicantLastName,
          passportNumber: input.passportNumber,
          passportExpiry: input.passportExpiry,
          gender: input.gender,
          dateOfBirth: input.dateOfBirth,
          contactEmail: input.contactEmail,
          contactPhone: input.contactPhone,
          notes: input.notes,
        });
        return toVisaRequestDto(row);
      } catch (error) {
        if (isUniqueReferenceError(error)) continue;
        throw error;
      }
    }
    throw new BadRequestError('Could not generate a unique visa reference, please retry');
  },

  async listOwn(userId: string, query: VisaQuery): Promise<Paginated<VisaRequestDto>> {
    const { rows, total } = await visaRepository.listByUser(userId, query);
    return { items: rows.map(toVisaRequestDto), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async listAdmin(query: VisaQuery): Promise<Paginated<VisaRequestDto>> {
    const { rows, total } = await visaRepository.listAll(query);
    return { items: rows.map(toVisaRequestDto), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async getOne(id: string, userId: string, isAdmin: boolean): Promise<VisaRequestDto> {
    const row = await visaRepository.findById(id);
    if (!row) throw new NotFoundError('Visa request not found');
    assertAccess(row.userId, userId, isAdmin);
    return toVisaRequestDto(row);
  },

  async addDocument(
    id: string,
    userId: string,
    isAdmin: boolean,
    input: AddVisaDocumentInput,
  ): Promise<VisaRequestDto> {
    const row = await visaRepository.findById(id);
    if (!row) throw new NotFoundError('Visa request not found');
    assertAccess(row.userId, userId, isAdmin);
    await visaRepository.addDocument({
      visaRequestId: id,
      type: input.type,
      url: input.url,
      fileName: input.fileName,
    });
    const refreshed = await visaRepository.findById(id);
    if (!refreshed) throw new NotFoundError('Visa request not found');
    return toVisaRequestDto(refreshed);
  },

  async updateStatus(id: string, input: UpdateVisaStatusInput): Promise<VisaRequestDto> {
    const row = await visaRepository.findById(id);
    if (!row) throw new NotFoundError('Visa request not found');
    const updated = await visaRepository.update(id, {
      status: input.status,
      notes: input.notes ?? row.notes,
      fee: input.fee,
      reviewedAt: new Date(),
    });
    return toVisaRequestDto(updated);
  },
};
