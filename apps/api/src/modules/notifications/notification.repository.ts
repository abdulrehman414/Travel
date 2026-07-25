import { prisma, type Notification, type Prisma } from '@travel/db';
import type { NotificationQuery } from '@travel/types';

export type NotificationRow = Notification;

function buildWhere(userId: string, query: NotificationQuery): Prisma.NotificationWhereInput {
  const where: Prisma.NotificationWhereInput = { userId };
  if (query.unread) where.readAt = null;
  return where;
}

export const notificationRepository = {
  async list(
    userId: string,
    query: NotificationQuery,
  ): Promise<{ rows: NotificationRow[]; total: number }> {
    const where = buildWhere(userId, query);
    const skip = (query.page - 1) * query.limit;

    const [rows, total] = await prisma.$transaction([
      prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: query.limit }),
      prisma.notification.count({ where }),
    ]);
    return { rows, total };
  },

  countUnread(userId: string): Promise<number> {
    return prisma.notification.count({ where: { userId, readAt: null } });
  },

  findOwned(id: string, userId: string): Promise<NotificationRow | null> {
    return prisma.notification.findFirst({ where: { id, userId } });
  },

  markRead(id: string): Promise<NotificationRow> {
    return prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  },

  async markAllRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return result.count;
  },

  delete(id: string): Promise<NotificationRow> {
    return prisma.notification.delete({ where: { id } });
  },
};
