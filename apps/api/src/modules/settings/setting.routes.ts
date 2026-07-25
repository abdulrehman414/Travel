import { Router } from 'express';
import { settingKeyParamSchema, settingQuerySchema, upsertSettingSchema } from '@travel/types';
import { settingController } from './setting.controller';
import { asyncHandler } from '../../lib/async-handler';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { requirePermissions } from '../../middleware/authorize';

export const settingRouter: Router = Router();

// Public curated settings (literal path registered before '/:key').
settingRouter.get('/public', asyncHandler(settingController.getPublic));

// Admin.
settingRouter.get(
  '/',
  authenticate,
  requirePermissions('setting:read'),
  validate({ query: settingQuerySchema }),
  asyncHandler(settingController.list),
);

settingRouter.get(
  '/:key',
  authenticate,
  requirePermissions('setting:read'),
  validate({ params: settingKeyParamSchema }),
  asyncHandler(settingController.getByKey),
);

settingRouter.put(
  '/:key',
  authenticate,
  requirePermissions('setting:update'),
  validate({ params: settingKeyParamSchema, body: upsertSettingSchema }),
  asyncHandler(settingController.upsert),
);

settingRouter.delete(
  '/:key',
  authenticate,
  requirePermissions('setting:delete'),
  validate({ params: settingKeyParamSchema }),
  asyncHandler(settingController.remove),
);
