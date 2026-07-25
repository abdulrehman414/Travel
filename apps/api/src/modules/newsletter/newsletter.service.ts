import { buildPageMeta } from '@travel/types';
import type {
  NewsletterQuery,
  NewsletterSubscriberDto,
  Paginated,
  SubscribeNewsletterInput,
} from '@travel/types';
import { newsletterRepository, type SubscriberRow } from './newsletter.repository';
import { NotFoundError } from '../../lib/api-error';

function toDto(row: SubscriberRow): NewsletterSubscriberDto {
  return {
    id: row.id,
    email: row.email,
    locale: row.locale,
    confirmed: row.confirmed,
    unsubscribedAt: row.unsubscribedAt ? row.unsubscribedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export const newsletterService = {
  async subscribe(input: SubscribeNewsletterInput): Promise<NewsletterSubscriberDto> {
    return toDto(await newsletterRepository.subscribe(input.email, input.locale));
  },

  async unsubscribe(email: string): Promise<{ unsubscribed: boolean }> {
    const unsubscribed = await newsletterRepository.unsubscribe(email);
    return { unsubscribed };
  },

  async list(query: NewsletterQuery): Promise<Paginated<NewsletterSubscriberDto>> {
    const { rows, total } = await newsletterRepository.list(query);
    return { items: rows.map(toDto), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async remove(id: string): Promise<void> {
    const existing = await newsletterRepository.findById(id);
    if (!existing) throw new NotFoundError('Subscriber not found');
    await newsletterRepository.delete(id);
  },
};
