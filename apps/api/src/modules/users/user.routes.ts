import { Router } from 'express';
import { idParamSchema, setUserRolesSchema, updateUserSchema, userQuerySchema } from '@travel/types';
import { userController } from './user.controller';
import { asyncHandler } from '../../lib/async-handler';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { requirePermissions } from '../../middleware/authorize';

export const userRouter: Router = Router();

// All user-management routes are admin-only (authenticate + requirePermissions).
userRouter.get(
  '/',
  authenticate,
  requirePermissions('user:read'),
  validate({ query: userQuerySchema }),
  asyncHandler(userController.list),
);

userRouter.get(
  '/:id',
  authenticate,
  requirePermissions('user:read'),
  validate({ params: idParamSchema }),
  asyncHandler(userController.getById),
);

// Registered before "/:id" so the more specific literal segment wins.
userRouter.patch(
  '/:id/roles',
  authenticate,
  requirePermissions('user:update'),
  validate({ params: idParamSchema, body: setUserRolesSchema }),
  asyncHandler(userController.setRoles),
);

userRouter.patch(
  '/:id',
  authenticate,
  requirePermissions('user:update'),
  validate({ params: idParamSchema, body: updateUserSchema }),
  asyncHandler(userController.update),
);

userRouter.delete(
  '/:id',
  authenticate,
  requirePermissions('user:delete'),
  validate({ params: idParamSchema }),
  asyncHandler(userController.remove),
);
