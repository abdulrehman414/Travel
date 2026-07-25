import { Router } from 'express';
import {
  addVisaDocumentSchema,
  createVisaRequestSchema,
  idParamSchema,
  updateVisaStatusSchema,
  visaQuerySchema,
} from '@travel/types';
import { visaController } from './visa.controller';
import { asyncHandler } from '../../lib/async-handler';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { requirePermissions } from '../../middleware/authorize';

export const visaRouter: Router = Router();

// Admin.
visaRouter.get(
  '/admin/list',
  authenticate,
  requirePermissions('visa:read'),
  validate({ query: visaQuerySchema }),
  asyncHandler(visaController.listAdmin),
);

visaRouter.patch(
  '/:id/status',
  authenticate,
  requirePermissions('visa:update'),
  validate({ params: idParamSchema, body: updateVisaStatusSchema }),
  asyncHandler(visaController.updateStatus),
);

// Authenticated customer.
visaRouter.post(
  '/',
  authenticate,
  validate({ body: createVisaRequestSchema }),
  asyncHandler(visaController.create),
);

visaRouter.get(
  '/',
  authenticate,
  validate({ query: visaQuerySchema }),
  asyncHandler(visaController.listOwn),
);

visaRouter.get(
  '/:id',
  authenticate,
  validate({ params: idParamSchema }),
  asyncHandler(visaController.getOne),
);

visaRouter.post(
  '/:id/documents',
  authenticate,
  validate({ params: idParamSchema, body: addVisaDocumentSchema }),
  asyncHandler(visaController.addDocument),
);
