import type { NotificationDto } from '@travel/types';
import type { NotificationRow } from './notification.repository';

export function toNotification(row: NotificationRow): NotificationDto {
  return {
    id: row.id,
    type: row.type,
    channel: row.channel,
    titleEn: row.titleEn,
    titleAr: row.titleAr,
    bodyEn: row.bodyEn,
    bodyAr: row.bodyAr,
    data: row.data ?? null,
    readAt: row.readAt ? row.readAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}
