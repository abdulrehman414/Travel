import { Router } from 'express';
import { idParamSchema, initiatePaymentSchema, paymentQuerySchema, refundPaymentSchema } from '@travel/types';
import { paymentController } from './payment.controller';
import { asyncHandler } from '../../lib/async-handler';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { requirePermissions } from '../../middleware/authorize';

export const paymentRouter: Router = Router();

// Gateway webhook (no auth — verified by provider signature).
paymentRouter.post('/webhook/:provider', asyncHandler(paymentController.webhook));

// Authenticated customer.
paymentRouter.post(
  '/initiate',
  authenticate,
  validate({ body: initiatePaymentSchema }),
  asyncHandler(paymentController.initiate),
);

paymentRouter.post(
  '/:id/confirm-mock',
  authenticate,
  validate({ params: idParamSchema }),
  asyncHandler(paymentController.confirmMock),
);

paymentRouter.get(
  '/booking/:bookingId',
  authenticate,
  asyncHandler(paymentController.listByBooking),
);

// Admin.
paymentRouter.get(
  '/admin/list',
  authenticate,
  requirePermissions('payment:read'),
  validate({ query: paymentQuerySchema }),
  asyncHandler(paymentController.listAdmin),
);

paymentRouter.post(
  '/:id/refund',
  authenticate,
  requirePermissions('payment:update'),
  validate({ params: idParamSchema, body: refundPaymentSchema }),
  asyncHandler(paymentController.refund),
);
