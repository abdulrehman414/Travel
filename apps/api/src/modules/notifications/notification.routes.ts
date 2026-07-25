import { Router } from 'express';
import { idParamSchema, notificationQuerySchema } from '@travel/types';
import { notificationController } from './notification.controller';
import { asyncHandler } from '../../lib/async-handler';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';

export const notificationRouter: Router = Router();

// Every route requires an authenticated principal and is scoped to req.user.id.
// Literal paths are registered before the "/:id" catch-all so they win.
notificationRouter.get(
  '/',
  authenticate,
  validate({ query: notificationQuerySchema }),
  asyncHandler(notificationController.list),
);

notificationRouter.get(
  '/unread-count',
  authenticate,
  asyncHandler(notificationController.unreadCount),
);

notificationRouter.patch(
  '/read-all',
  authenticate,
  asyncHandler(notificationController.markAllRead),
);

notificationRouter.patch(
  '/:id/read',
  authenticate,
  validate({ params: idParamSchema }),
  asyncHandler(notificationController.markRead),
);

notificationRouter.delete(
  '/:id',
  authenticate,
  validate({ params: idParamSchema }),
  asyncHandler(notificationController.remove),
);
