import type { Request, Response } from 'express';
import type { NotificationQuery } from '@travel/types';
import { notificationService } from './notification.service';
import { sendNoContent, sendPaginated, sendSuccess } from '../../lib/http';
import { UnauthorizedError } from '../../lib/api-error';

export const notificationController = {
  async list(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const result = await notificationService.list(
      req.user.id,
      req.query as unknown as NotificationQuery,
    );
    sendPaginated(res, result.items, result.meta);
  },

  async unreadCount(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const result = await notificationService.unreadCount(req.user.id);
    sendSuccess(res, result);
  },

  async markRead(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const { id } = req.params as { id: string };
    const notification = await notificationService.markRead(id, req.user.id);
    sendSuccess(res, notification, 'Notification marked as read');
  },

  async markAllRead(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const result = await notificationService.markAllRead(req.user.id);
    sendSuccess(res, result, 'All notifications marked as read');
  },

  async remove(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const { id } = req.params as { id: string };
    await notificationService.remove(id, req.user.id);
    sendNoContent(res);
  },
};
