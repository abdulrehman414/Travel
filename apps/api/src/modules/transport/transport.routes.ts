import { Router } from 'express';
import {
  createTransportSchema,
  idParamSchema,
  slugParamSchema,
  transportQuerySchema,
  updateTransportSchema,
} from '@travel/types';
import { transportController } from './transport.controller';
import { asyncHandler } from '../../lib/async-handler';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { requirePermissions } from '../../middleware/authorize';

export const transportRouter: Router = Router();

// Admin (literal routes before public '/:slug').
transportRouter.get(
  '/admin/list',
  authenticate,
  requirePermissions('transport:read'),
  validate({ query: transportQuerySchema }),
  asyncHandler(transportController.listAdmin),
);
transportRouter.post(
  '/',
  authenticate,
  requirePermissions('transport:create'),
  validate({ body: createTransportSchema }),
  asyncHandler(transportController.create),
);
transportRouter.put(
  '/:id',
  authenticate,
  requirePermissions('transport:update'),
  validate({ params: idParamSchema, body: updateTransportSchema }),
  asyncHandler(transportController.update),
);
transportRouter.delete(
  '/:id',
  authenticate,
  requirePermissions('transport:delete'),
  validate({ params: idParamSchema }),
  asyncHandler(transportController.remove),
);

// Public.
transportRouter.get(
  '/',
  validate({ query: transportQuerySchema }),
  asyncHandler(transportController.listPublic),
);
transportRouter.get(
  '/:slug',
  validate({ params: slugParamSchema }),
  asyncHandler(transportController.getBySlug),
);
