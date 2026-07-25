import { Router } from 'express';
import { createHotelSchema, hotelQuerySchema, idParamSchema, slugParamSchema, updateHotelSchema } from '@travel/types';
import { hotelController } from './hotel.controller';
import { asyncHandler } from '../../lib/async-handler';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { requirePermissions } from '../../middleware/authorize';

export const hotelRouter: Router = Router();

// Admin (literal routes before public '/:slug').
hotelRouter.get(
  '/admin/list',
  authenticate,
  requirePermissions('hotel:read'),
  validate({ query: hotelQuerySchema }),
  asyncHandler(hotelController.list),
);

hotelRouter.get(
  '/admin/:id',
  authenticate,
  requirePermissions('hotel:read'),
  validate({ params: idParamSchema }),
  asyncHandler(hotelController.getById),
);

hotelRouter.post(
  '/',
  authenticate,
  requirePermissions('hotel:create'),
  validate({ body: createHotelSchema }),
  asyncHandler(hotelController.create),
);

hotelRouter.put(
  '/:id',
  authenticate,
  requirePermissions('hotel:update'),
  validate({ params: idParamSchema, body: updateHotelSchema }),
  asyncHandler(hotelController.update),
);

hotelRouter.delete(
  '/:id',
  authenticate,
  requirePermissions('hotel:delete'),
  validate({ params: idParamSchema }),
  asyncHandler(hotelController.remove),
);

// Public.
hotelRouter.get('/', validate({ query: hotelQuerySchema }), asyncHandler(hotelController.list));
hotelRouter.get(
  '/:slug',
  validate({ params: slugParamSchema }),
  asyncHandler(hotelController.getBySlug),
);
