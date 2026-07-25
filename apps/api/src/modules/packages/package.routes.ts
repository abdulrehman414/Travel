import { Router } from 'express';
import {
  createPackageSchema,
  idParamSchema,
  packageQuerySchema,
  setPackageStatusSchema,
  slugParamSchema,
  updatePackageSchema,
} from '@travel/types';
import { packageController } from './package.controller';
import { asyncHandler } from '../../lib/async-handler';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { requirePermissions } from '../../middleware/authorize';

export const packageRouter: Router = Router();

// ------------------------------------------------------------- admin --------
// Registered before the public "/:slug" route so the literal path wins.
packageRouter.get(
  '/admin/list',
  authenticate,
  requirePermissions('package:read'),
  validate({ query: packageQuerySchema }),
  asyncHandler(packageController.listAdmin),
);

packageRouter.get(
  '/admin/:id',
  authenticate,
  requirePermissions('package:read'),
  validate({ params: idParamSchema }),
  asyncHandler(packageController.getByIdAdmin),
);

packageRouter.post(
  '/',
  authenticate,
  requirePermissions('package:create'),
  validate({ body: createPackageSchema }),
  asyncHandler(packageController.create),
);

packageRouter.put(
  '/:id',
  authenticate,
  requirePermissions('package:update'),
  validate({ params: idParamSchema, body: updatePackageSchema }),
  asyncHandler(packageController.update),
);

packageRouter.patch(
  '/:id/status',
  authenticate,
  requirePermissions('package:update'),
  validate({ params: idParamSchema, body: setPackageStatusSchema }),
  asyncHandler(packageController.setStatus),
);

packageRouter.delete(
  '/:id',
  authenticate,
  requirePermissions('package:delete'),
  validate({ params: idParamSchema }),
  asyncHandler(packageController.remove),
);

// ------------------------------------------------------------- public -------
packageRouter.get(
  '/',
  validate({ query: packageQuerySchema }),
  asyncHandler(packageController.listPublic),
);

packageRouter.get(
  '/:slug',
  validate({ params: slugParamSchema }),
  asyncHandler(packageController.getBySlug),
);
