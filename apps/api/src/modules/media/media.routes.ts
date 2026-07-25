import { Router } from 'express';
import multer from 'multer';
import { idParamSchema, mediaQuerySchema } from '@travel/types';
import { mediaController } from './media.controller';
import { asyncHandler } from '../../lib/async-handler';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { requirePermissions } from '../../middleware/authorize';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

export const mediaRouter: Router = Router();

mediaRouter.post(
  '/upload',
  authenticate,
  requirePermissions('media:create'),
  upload.single('file'),
  asyncHandler(mediaController.upload),
);

mediaRouter.get(
  '/admin/list',
  authenticate,
  requirePermissions('media:read'),
  validate({ query: mediaQuerySchema }),
  asyncHandler(mediaController.list),
);

mediaRouter.delete(
  '/:id',
  authenticate,
  requirePermissions('media:delete'),
  validate({ params: idParamSchema }),
  asyncHandler(mediaController.remove),
);
