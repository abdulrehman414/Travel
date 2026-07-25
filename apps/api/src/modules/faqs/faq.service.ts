import { buildPageMeta } from '@travel/types';
import type {
  CreateFaqInput,
  FaqDto,
  FaqQuery,
  Paginated,
  UpdateFaqInput,
} from '@travel/types';
import type { Prisma } from '@travel/db';
import { faqRepository } from './faq.repository';
import { toFaq } from './faq.mapper';
import { ConflictError, NotFoundError } from '../../lib/api-error';

function toCreateData(input: CreateFaqInput): Prisma.FaqUncheckedCreateInput {
  return {
    category: input.category,
    questionEn: input.questionEn,
    questionAr: input.questionAr,
    answerEn: input.answerEn,
    answerAr: input.answerAr,
    order: input.order,
    published: input.published,
  };
}

export const faqService = {
  async listPublic(query: FaqQuery): Promise<Paginated<FaqDto>> {
    const { rows, total } = await faqRepository.list(query, { onlyPublished: true });
    return { items: rows.map(toFaq), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async listAdmin(query: FaqQuery): Promise<Paginated<FaqDto>> {
    const { rows, total } = await faqRepository.list(query, { onlyPublished: false });
    return { items: rows.map(toFaq), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async create(input: CreateFaqInput): Promise<FaqDto> {
    try {
      const row = await faqRepository.create(toCreateData(input));
      return toFaq(row);
    } catch (error) {
      if (isUniqueConstraintError(error)) throw new ConflictError('A faq with these values already exists');
      throw error;
    }
  },

  async update(id: string, input: UpdateFaqInput): Promise<FaqDto> {
    const existing = await faqRepository.findById(id);
    if (!existing) throw new NotFoundError('Faq not found');

    const scalar: Prisma.FaqUncheckedUpdateInput = { ...input };

    try {
      const row = await faqRepository.update(id, scalar);
      return toFaq(row);
    } catch (error) {
      if (isUniqueConstraintError(error)) throw new ConflictError('A faq with these values already exists');
      throw error;
    }
  },

  async remove(id: string): Promise<void> {
    const existing = await faqRepository.findById(id);
    if (!existing) throw new NotFoundError('Faq not found');
    await faqRepository.delete(id);
  },
};

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002'
  );
}
