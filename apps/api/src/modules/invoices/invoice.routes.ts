import { Router } from 'express';
import { generateInvoiceSchema, idParamSchema, invoiceQuerySchema } from '@travel/types';
import { invoiceController } from './invoice.controller';
import { asyncHandler } from '../../lib/async-handler';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { requirePermissions } from '../../middleware/authorize';

export const invoiceRouter: Router = Router();

// Admin.
invoiceRouter.get(
  '/admin/list',
  authenticate,
  requirePermissions('invoice:read'),
  validate({ query: invoiceQuerySchema }),
  asyncHandler(invoiceController.listAdmin),
);

invoiceRouter.patch(
  '/:id/void',
  authenticate,
  requirePermissions('invoice:update'),
  validate({ params: idParamSchema }),
  asyncHandler(invoiceController.voidInvoice),
);

invoiceRouter.post(
  '/:id/send',
  authenticate,
  requirePermissions('invoice:update'),
  validate({ params: idParamSchema }),
  asyncHandler(invoiceController.send),
);

// Authenticated (owner or admin).
invoiceRouter.post(
  '/generate',
  authenticate,
  validate({ body: generateInvoiceSchema }),
  asyncHandler(invoiceController.generate),
);

invoiceRouter.get(
  '/booking/:bookingId',
  authenticate,
  asyncHandler(invoiceController.getByBooking),
);

invoiceRouter.get(
  '/:id/pdf',
  authenticate,
  validate({ params: idParamSchema }),
  asyncHandler(invoiceController.downloadPdf),
);

invoiceRouter.get(
  '/:id',
  authenticate,
  validate({ params: idParamSchema }),
  asyncHandler(invoiceController.getById),
);
