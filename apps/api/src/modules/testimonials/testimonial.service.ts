import { buildPageMeta } from '@travel/types';
import type {
  CreateTestimonialInput,
  Paginated,
  ReviewStatus,
  TestimonialDto,
  TestimonialQuery,
  UpdateTestimonialInput,
} from '@travel/types';
import type { Prisma } from '@travel/db';
import { testimonialRepository } from './testimonial.repository';
import { toTestimonial } from './testimonial.mapper';
import { NotFoundError } from '../../lib/api-error';

function toCreateData(input: CreateTestimonialInput): Prisma.TestimonialUncheckedCreateInput {
  return {
    userId: input.userId,
    authorName: input.authorName,
    authorTitle: input.authorTitle,
    authorAvatarUrl: input.authorAvatarUrl,
    country: input.country,
    rating: input.rating,
    quoteEn: input.quoteEn,
    quoteAr: input.quoteAr,
    status: input.status,
    featured: input.featured,
    order: input.order,
  };
}

export const testimonialService = {
  async listPublic(query: TestimonialQuery): Promise<Paginated<TestimonialDto>> {
    const { rows, total } = await testimonialRepository.list(query, { onlyApproved: true });
    return { items: rows.map(toTestimonial), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async listAdmin(query: TestimonialQuery): Promise<Paginated<TestimonialDto>> {
    const { rows, total } = await testimonialRepository.list(query, { onlyApproved: false });
    return { items: rows.map(toTestimonial), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async create(input: CreateTestimonialInput): Promise<TestimonialDto> {
    const row = await testimonialRepository.create(toCreateData(input));
    return toTestimonial(row);
  },

  async update(id: string, input: UpdateTestimonialInput): Promise<TestimonialDto> {
    const existing = await testimonialRepository.findById(id);
    if (!existing) throw new NotFoundError('Testimonial not found');
    const row = await testimonialRepository.update(id, input);
    return toTestimonial(row);
  },

  async setStatus(id: string, status: ReviewStatus): Promise<TestimonialDto> {
    const existing = await testimonialRepository.findById(id);
    if (!existing) throw new NotFoundError('Testimonial not found');
    const row = await testimonialRepository.setStatus(id, status);
    return toTestimonial(row);
  },

  async remove(id: string): Promise<void> {
    const existing = await testimonialRepository.findById(id);
    if (!existing) throw new NotFoundError('Testimonial not found');
    await testimonialRepository.delete(id);
  },
};
