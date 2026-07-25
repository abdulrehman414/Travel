import type { z } from 'zod';
import { booleanQueryParam, paginationQuerySchema } from './common';
import type { NotificationChannel, NotificationType } from './enums';

// --------------------------------------------------------------- inputs -----

export const notificationQuerySchema = paginationQuerySchema.extend({
  unread: booleanQueryParam.optional(),
});
export type NotificationQuery = z.infer<typeof notificationQuerySchema>;

// -------------------------------------------------------------- outputs -----

export interface NotificationDto {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  data: unknown;
  readAt: string | null;
  createdAt: string;
}

export interface UnreadCountDto {
  count: number;
}

export interface MarkAllReadDto {
  updated: number;
}
