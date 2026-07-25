import { Router } from 'express';
import { createRoleSchema, idParamSchema, setRolePermissionsSchema, updateRoleSchema } from '@travel/types';
import { rbacController } from './rbac.controller';
import { asyncHandler } from '../../lib/async-handler';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { requirePermissions } from '../../middleware/authorize';

export const roleRouter: Router = Router();

roleRouter.get('/', authenticate, requirePermissions('role:read'), asyncHandler(rbacController.listRoles));
roleRouter.get(
  '/:id',
  authenticate,
  requirePermissions('role:read'),
  validate({ params: idParamSchema }),
  asyncHandler(rbacController.getRole),
);
roleRouter.post(
  '/',
  authenticate,
  requirePermissions('role:create'),
  validate({ body: createRoleSchema }),
  asyncHandler(rbacController.createRole),
);
roleRouter.put(
  '/:id',
  authenticate,
  requirePermissions('role:update'),
  validate({ params: idParamSchema, body: updateRoleSchema }),
  asyncHandler(rbacController.updateRole),
);
roleRouter.put(
  '/:id/permissions',
  authenticate,
  requirePermissions('role:update'),
  validate({ params: idParamSchema, body: setRolePermissionsSchema }),
  asyncHandler(rbacController.setPermissions),
);
roleRouter.delete(
  '/:id',
  authenticate,
  requirePermissions('role:delete'),
  validate({ params: idParamSchema }),
  asyncHandler(rbacController.deleteRole),
);

export const permissionRouter: Router = Router();

permissionRouter.get(
  '/',
  authenticate,
  requirePermissions('permission:read'),
  asyncHandler(rbacController.listPermissions),
);
