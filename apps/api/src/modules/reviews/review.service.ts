import { buildPageMeta } from '@travel/types';
import type {
  AdminReviewQuery,
  CreateReviewInput,
  Paginated,
  PublicReviewQuery,
  ReviewDto,
  ReviewStatus,
} from '@travel/types';
import { reviewRepository } from './review.repository';
import { toReviewDto } from './review.mapper';
import { ConflictError, NotFoundError } from '../../lib/api-error';

export const reviewService = {
  async listPublic(query: PublicReviewQuery): Promise<Paginated<ReviewDto>> {
    const { rows, total } = await reviewRepository.listPublic(query);
    return { items: rows.map(toReviewDto), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async listAdmin(query: AdminReviewQuery): Promise<Paginated<ReviewDto>> {
    const { rows, total } = await reviewRepository.listAdmin(query);
    return { items: rows.map(toReviewDto), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async create(input: CreateReviewInput, userId: string): Promise<ReviewDto> {
    try {
      const row = await reviewRepository.create({
        packageId: input.packageId,
        userId,
        rating: input.rating,
        titleEn: input.titleEn,
        comment: input.comment,
      });
      return toReviewDto(row);
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'P2002'
      ) {
        throw new ConflictError('You have already reviewed this package');
      }
      throw error;
    }
  },

  async setStatus(id: string, status: ReviewStatus): Promise<ReviewDto> {
    const existing = await reviewRepository.findById(id);
    if (!existing) throw new NotFoundError('Review not found');
    const row = await reviewRepository.setStatus(id, status);
    await reviewRepository.recomputePackageRating(row.packageId);
    return toReviewDto(row);
  },

  async remove(id: string): Promise<void> {
    const existing = await reviewRepository.findById(id);
    if (!existing) throw new NotFoundError('Review not found');
    await reviewRepository.delete(id);
    await reviewRepository.recomputePackageRating(existing.packageId);
  },
};
