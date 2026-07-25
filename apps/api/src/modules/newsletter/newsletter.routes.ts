import { Router } from 'express';
import {
  idParamSchema,
  newsletterQuerySchema,
  subscribeNewsletterSchema,
  unsubscribeNewsletterSchema,
} from '@travel/types';
import { newsletterController } from './newsletter.controller';
import { asyncHandler } from '../../lib/async-handler';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { requirePermissions } from '../../middleware/authorize';

export const newsletterRouter: Router = Router();

// Public.
newsletterRouter.post(
  '/subscribe',
  validate({ body: subscribeNewsletterSchema }),
  asyncHandler(newsletterController.subscribe),
);
newsletterRouter.post(
  '/unsubscribe',
  validate({ body: unsubscribeNewsletterSchema }),
  asyncHandler(newsletterController.unsubscribe),
);

// Admin.
newsletterRouter.get(
  '/admin/list',
  authenticate,
  requirePermissions('newsletter:read'),
  validate({ query: newsletterQuerySchema }),
  asyncHandler(newsletterController.list),
);
newsletterRouter.delete(
  '/:id',
  authenticate,
  requirePermissions('newsletter:delete'),
  validate({ params: idParamSchema }),
  asyncHandler(newsletterController.remove),
);
