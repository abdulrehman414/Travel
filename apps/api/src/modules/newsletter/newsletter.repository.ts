import { prisma, type Prisma } from '@travel/db';
import type { NewsletterQuery } from '@travel/types';

export type SubscriberRow = Prisma.NewsletterSubscriberGetPayload<object>;

export const newsletterRepository = {
  subscribe(email: string, locale: string): Promise<SubscriberRow> {
    return prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { unsubscribedAt: null, locale },
      create: { email, locale },
    });
  },

  async unsubscribe(email: string): Promise<boolean> {
    const result = await prisma.newsletterSubscriber.updateMany({
      where: { email, unsubscribedAt: null },
      data: { unsubscribedAt: new Date() },
    });
    return result.count > 0;
  },

  findById(id: string): Promise<SubscriberRow | null> {
    return prisma.newsletterSubscriber.findUnique({ where: { id } });
  },

  delete(id: string): Promise<unknown> {
    return prisma.newsletterSubscriber.delete({ where: { id } });
  },

  async list(query: NewsletterQuery): Promise<{ rows: SubscriberRow[]; total: number }> {
    const where: Prisma.NewsletterSubscriberWhereInput = {};
    if (query.confirmed !== undefined) where.confirmed = query.confirmed;
    if (query.search) where.email = { contains: query.search, mode: 'insensitive' };
    const skip = (query.page - 1) * query.limit;
    const [rows, total] = await prisma.$transaction([
      prisma.newsletterSubscriber.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: query.limit }),
      prisma.newsletterSubscriber.count({ where }),
    ]);
    return { rows, total };
  },
};
