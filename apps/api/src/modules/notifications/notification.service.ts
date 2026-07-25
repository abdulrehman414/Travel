import { buildPageMeta } from '@travel/types';
import type {
  MarkAllReadDto,
  NotificationDto,
  NotificationQuery,
  Paginated,
  UnreadCountDto,
} from '@travel/types';
import { notificationRepository } from './notification.repository';
import { toNotification } from './notification.mapper';
import { NotFoundError } from '../../lib/api-error';

export const notificationService = {
  async list(userId: string, query: NotificationQuery): Promise<Paginated<NotificationDto>> {
    const { rows, total } = await notificationRepository.list(userId, query);
    return { items: rows.map(toNotification), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async unreadCount(userId: string): Promise<UnreadCountDto> {
    const count = await notificationRepository.countUnread(userId);
    return { count };
  },

  async markRead(id: string, userId: string): Promise<NotificationDto> {
    const existing = await notificationRepository.findOwned(id, userId);
    if (!existing) throw new NotFoundError('Notification not found');
    const row = await notificationRepository.markRead(id);
    return toNotification(row);
  },

  async markAllRead(userId: string): Promise<MarkAllReadDto> {
    const updated = await notificationRepository.markAllRead(userId);
    return { updated };
  },

  async remove(id: string, userId: string): Promise<void> {
    const existing = await notificationRepository.findOwned(id, userId);
    if (!existing) throw new NotFoundError('Notification not found');
    await notificationRepository.delete(id);
  },
};
