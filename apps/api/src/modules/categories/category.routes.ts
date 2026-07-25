import { Router } from 'express';
import {
  categoryQuerySchema,
  createCategorySchema,
  idParamSchema,
  updateCategorySchema,
} from '@travel/types';
import { categoryController } from './category.controller';
import { asyncHandler } from '../../lib/async-handler';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { requirePermissions } from '../../middleware/authorize';

export const categoryRouter: Router = Router();

// ------------------------------------------------------------- admin --------
// Registered before the public "/:id" route so the literal path wins.
categoryRouter.get(
  '/admin/list',
  authenticate,
  requirePermissions('category:read'),
  validate({ query: categoryQuerySchema }),
  asyncHandler(categoryController.listAdmin),
);

categoryRouter.post(
  '/',
  authenticate,
  requirePermissions('category:create'),
  validate({ body: createCategorySchema }),
  asyncHandler(categoryController.create),
);

categoryRouter.put(
  '/:id',
  authenticate,
  requirePermissions('category:update'),
  validate({ params: idParamSchema, body: updateCategorySchema }),
  asyncHandler(categoryController.update),
);

categoryRouter.delete(
  '/:id',
  authenticate,
  requirePermissions('category:delete'),
  validate({ params: idParamSchema }),
  asyncHandler(categoryController.remove),
);

// ------------------------------------------------------------- public -------
categoryRouter.get(
  '/',
  validate({ query: categoryQuerySchema }),
  asyncHandler(categoryController.listPublic),
);

categoryRouter.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(categoryController.getById),
);
