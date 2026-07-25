import { Router } from 'express';
import { createFlightSchema, flightQuerySchema, idParamSchema, updateFlightSchema } from '@travel/types';
import { flightController } from './flight.controller';
import { asyncHandler } from '../../lib/async-handler';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { requirePermissions } from '../../middleware/authorize';

export const flightRouter: Router = Router();

flightRouter.get(
  '/admin/list',
  authenticate,
  requirePermissions('flight:read'),
  validate({ query: flightQuerySchema }),
  asyncHandler(flightController.list),
);
flightRouter.post(
  '/',
  authenticate,
  requirePermissions('flight:create'),
  validate({ body: createFlightSchema }),
  asyncHandler(flightController.create),
);
flightRouter.put(
  '/:id',
  authenticate,
  requirePermissions('flight:update'),
  validate({ params: idParamSchema, body: updateFlightSchema }),
  asyncHandler(flightController.update),
);
flightRouter.delete(
  '/:id',
  authenticate,
  requirePermissions('flight:delete'),
  validate({ params: idParamSchema }),
  asyncHandler(flightController.remove),
);

flightRouter.get('/', validate({ query: flightQuerySchema }), asyncHandler(flightController.list));
flightRouter.get('/:id', validate({ params: idParamSchema }), asyncHandler(flightController.getById));
