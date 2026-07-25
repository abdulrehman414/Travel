import { Router } from 'express';
import {
  createTagSchema,
  idParamSchema,
  slugParamSchema,
  tagQuerySchema,
  updateTagSchema,
} from '@travel/types';
import { tagController } from './tag.controller';
import { asyncHandler } from '../../lib/async-handler';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { requirePermissions } from '../../middleware/authorize';

export const tagRouter: Router = Router();

// ------------------------------------------------------------- admin --------
// Registered before the public "/:slug" route so the literal path wins.
tagRouter.get(
  '/admin/list',
  authenticate,
  requirePermissions('tag:read'),
  validate({ query: tagQuerySchema }),
  asyncHandler(tagController.listAdmin),
);

tagRouter.post(
  '/',
  authenticate,
  requirePermissions('tag:create'),
  validate({ body: createTagSchema }),
  asyncHandler(tagController.create),
);

tagRouter.put(
  '/:id',
  authenticate,
  requirePermissions('tag:update'),
  validate({ params: idParamSchema, body: updateTagSchema }),
  asyncHandler(tagController.update),
);

tagRouter.delete(
  '/:id',
  authenticate,
  requirePermissions('tag:delete'),
  validate({ params: idParamSchema }),
  asyncHandler(tagController.remove),
);

// ------------------------------------------------------------- public -------
tagRouter.get(
  '/',
  validate({ query: tagQuerySchema }),
  asyncHandler(tagController.listPublic),
);

tagRouter.get(
  '/:slug',
  validate({ params: slugParamSchema }),
  asyncHandler(tagController.getBySlug),
);
