import { Router } from 'express';
import { createFaqSchema, faqQuerySchema, idParamSchema, updateFaqSchema } from '@travel/types';
import { faqController } from './faq.controller';
import { asyncHandler } from '../../lib/async-handler';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { requirePermissions } from '../../middleware/authorize';

export const faqRouter: Router = Router();

// ------------------------------------------------------------- admin --------
// Registered before the public "/" route so the literal path wins.
faqRouter.get(
  '/admin/list',
  authenticate,
  requirePermissions('faq:read'),
  validate({ query: faqQuerySchema }),
  asyncHandler(faqController.listAdmin),
);

faqRouter.post(
  '/',
  authenticate,
  requirePermissions('faq:create'),
  validate({ body: createFaqSchema }),
  asyncHandler(faqController.create),
);

faqRouter.put(
  '/:id',
  authenticate,
  requirePermissions('faq:update'),
  validate({ params: idParamSchema, body: updateFaqSchema }),
  asyncHandler(faqController.update),
);

faqRouter.delete(
  '/:id',
  authenticate,
  requirePermissions('faq:delete'),
  validate({ params: idParamSchema }),
  asyncHandler(faqController.remove),
);

// ------------------------------------------------------------- public -------
faqRouter.get('/', validate({ query: faqQuerySchema }), asyncHandler(faqController.listPublic));
