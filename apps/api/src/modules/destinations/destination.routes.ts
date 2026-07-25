import { Router } from 'express';
import {
  createDestinationSchema,
  destinationQuerySchema,
  idParamSchema,
  slugParamSchema,
  updateDestinationSchema,
} from '@travel/types';
import { destinationController } from './destination.controller';
import { asyncHandler } from '../../lib/async-handler';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { requirePermissions } from '../../middleware/authorize';

export const destinationRouter: Router = Router();

// ------------------------------------------------------------- admin --------
// Registered before the public "/:slug" route so the literal path wins.
destinationRouter.get(
  '/admin/list',
  authenticate,
  requirePermissions('destination:read'),
  validate({ query: destinationQuerySchema }),
  asyncHandler(destinationController.listAdmin),
);

destinationRouter.get(
  '/admin/:id',
  authenticate,
  requirePermissions('destination:read'),
  validate({ params: idParamSchema }),
  asyncHandler(destinationController.getByIdAdmin),
);

destinationRouter.post(
  '/',
  authenticate,
  requirePermissions('destination:create'),
  validate({ body: createDestinationSchema }),
  asyncHandler(destinationController.create),
);

destinationRouter.put(
  '/:id',
  authenticate,
  requirePermissions('destination:update'),
  validate({ params: idParamSchema, body: updateDestinationSchema }),
  asyncHandler(destinationController.update),
);

destinationRouter.delete(
  '/:id',
  authenticate,
  requirePermissions('destination:delete'),
  validate({ params: idParamSchema }),
  asyncHandler(destinationController.remove),
);

// ------------------------------------------------------------- public -------
destinationRouter.get(
  '/',
  validate({ query: destinationQuerySchema }),
  asyncHandler(destinationController.listPublic),
);

destinationRouter.get(
  '/:slug',
  validate({ params: slugParamSchema }),
  asyncHandler(destinationController.getBySlug),
);
