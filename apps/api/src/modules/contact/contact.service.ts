import { buildPageMeta } from '@travel/types';
import type {
  ContactMessageDto,
  ContactQuery,
  ContactStatus,
  CreateContactInput,
  Paginated,
} from '@travel/types';
import { contactRepository, type ContactRow } from './contact.repository';
import { NotFoundError } from '../../lib/api-error';

function toDto(row: ContactRow): ContactMessageDto {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export const contactService = {
  async create(input: CreateContactInput, userId?: string): Promise<ContactMessageDto> {
    const row = await contactRepository.create({ ...input, userId });
    return toDto(row);
  },

  async list(query: ContactQuery): Promise<Paginated<ContactMessageDto>> {
    const { rows, total } = await contactRepository.list(query);
    return { items: rows.map(toDto), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async getById(id: string): Promise<ContactMessageDto> {
    const row = await contactRepository.findById(id);
    if (!row) throw new NotFoundError('Message not found');
    return toDto(row);
  },

  async setStatus(id: string, status: ContactStatus): Promise<ContactMessageDto> {
    const existing = await contactRepository.findById(id);
    if (!existing) throw new NotFoundError('Message not found');
    return toDto(await contactRepository.update(id, { status }));
  },

  async remove(id: string): Promise<void> {
    const existing = await contactRepository.findById(id);
    if (!existing) throw new NotFoundError('Message not found');
    await contactRepository.delete(id);
  },
};
