import { Router } from 'express';
import { contactQuerySchema, createContactSchema, idParamSchema, updateContactStatusSchema } from '@travel/types';
import { contactController } from './contact.controller';
import { asyncHandler } from '../../lib/async-handler';
import { validate } from '../../middleware/validate';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate';
import { requirePermissions } from '../../middleware/authorize';

export const contactRouter: Router = Router();

// Public — anyone can send a message; attaches the user if logged in.
contactRouter.post(
  '/',
  optionalAuthenticate,
  validate({ body: createContactSchema }),
  asyncHandler(contactController.create),
);

// Admin.
contactRouter.get(
  '/admin/list',
  authenticate,
  requirePermissions('contact:read'),
  validate({ query: contactQuerySchema }),
  asyncHandler(contactController.list),
);
contactRouter.get(
  '/:id',
  authenticate,
  requirePermissions('contact:read'),
  validate({ params: idParamSchema }),
  asyncHandler(contactController.getById),
);
contactRouter.patch(
  '/:id/status',
  authenticate,
  requirePermissions('contact:update'),
  validate({ params: idParamSchema, body: updateContactStatusSchema }),
  asyncHandler(contactController.setStatus),
);
contactRouter.delete(
  '/:id',
  authenticate,
  requirePermissions('contact:delete'),
  validate({ params: idParamSchema }),
  asyncHandler(contactController.remove),
);
