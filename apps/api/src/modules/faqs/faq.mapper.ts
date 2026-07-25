import type { FaqDto } from '@travel/types';
import type { FaqRow } from './faq.repository';

export function toFaq(row: FaqRow): FaqDto {
  return {
    id: row.id,
    category: row.category,
    questionEn: row.questionEn,
    questionAr: row.questionAr,
    answerEn: row.answerEn,
    answerAr: row.answerAr,
    order: row.order,
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
