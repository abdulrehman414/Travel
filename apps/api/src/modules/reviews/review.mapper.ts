import type { ReviewDto } from '@travel/types';
import type { ReviewRow } from './review.repository';

export function toReviewDto(row: ReviewRow): ReviewDto {
  return {
    id: row.id,
    rating: row.rating,
    titleEn: row.titleEn,
    comment: row.comment,
    status: row.status,
    user: row.user
      ? {
          id: row.user.id,
          firstName: row.user.firstName,
          lastName: row.user.lastName,
          avatarUrl: row.user.avatarUrl,
        }
      : null,
    package: row.package
      ? {
          id: row.package.id,
          slug: row.package.slug,
          titleEn: row.package.titleEn,
          titleAr: row.package.titleAr,
        }
      : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
