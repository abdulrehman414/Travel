import { Router } from 'express';
import {
  adminBookingQuerySchema,
  bookingQuerySchema,
  cancelBookingSchema,
  createBookingSchema,
  idParamSchema,
  setBookingStatusSchema,
  updateBookingSchema,
} from '@travel/types';
import { bookingController } from './booking.controller';
import { asyncHandler } from '../../lib/async-handler';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { requirePermissions } from '../../middleware/authorize';

export const bookingRouter: Router = Router();

// Admin (literal routes before '/:id').
bookingRouter.get(
  '/admin/list',
  authenticate,
  requirePermissions('booking:read'),
  validate({ query: adminBookingQuerySchema }),
  asyncHandler(bookingController.listAdmin),
);

bookingRouter.patch(
  '/:id/status',
  authenticate,
  requirePermissions('booking:update'),
  validate({ params: idParamSchema, body: setBookingStatusSchema }),
  asyncHandler(bookingController.setStatus),
);

// Authenticated customer (own bookings).
bookingRouter.post(
  '/',
  authenticate,
  validate({ body: createBookingSchema }),
  asyncHandler(bookingController.create),
);

bookingRouter.get(
  '/',
  authenticate,
  validate({ query: bookingQuerySchema }),
  asyncHandler(bookingController.listOwn),
);

bookingRouter.get(
  '/:id',
  authenticate,
  validate({ params: idParamSchema }),
  asyncHandler(bookingController.getOne),
);

bookingRouter.patch(
  '/:id',
  authenticate,
  validate({ params: idParamSchema, body: updateBookingSchema }),
  asyncHandler(bookingController.update),
);

bookingRouter.post(
  '/:id/cancel',
  authenticate,
  validate({ params: idParamSchema, body: cancelBookingSchema }),
  asyncHandler(bookingController.cancel),
);
