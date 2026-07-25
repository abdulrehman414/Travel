import type { TestimonialDto } from '@travel/types';
import type { TestimonialRow } from './testimonial.repository';

export function toTestimonial(row: TestimonialRow): TestimonialDto {
  return {
    id: row.id,
    userId: row.userId,
    authorName: row.authorName,
    authorTitle: row.authorTitle,
    authorAvatarUrl: row.authorAvatarUrl,
    country: row.country,
    rating: row.rating,
    quoteEn: row.quoteEn,
    quoteAr: row.quoteAr,
    status: row.status,
    featured: row.featured,
    order: row.order,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
