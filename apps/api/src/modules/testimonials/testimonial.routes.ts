import { Router } from 'express';
import {
  createTestimonialSchema,
  idParamSchema,
  setTestimonialStatusSchema,
  testimonialQuerySchema,
  updateTestimonialSchema,
} from '@travel/types';
import { testimonialController } from './testimonial.controller';
import { asyncHandler } from '../../lib/async-handler';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { requirePermissions } from '../../middleware/authorize';

export const testimonialRouter: Router = Router();

// ------------------------------------------------------------- admin --------
// Registered before the public "/" route so the literal paths win.
testimonialRouter.get(
  '/admin/list',
  authenticate,
  requirePermissions('testimonial:read'),
  validate({ query: testimonialQuerySchema }),
  asyncHandler(testimonialController.listAdmin),
);

testimonialRouter.post(
  '/',
  authenticate,
  requirePermissions('testimonial:create'),
  validate({ body: createTestimonialSchema }),
  asyncHandler(testimonialController.create),
);

testimonialRouter.put(
  '/:id',
  authenticate,
  requirePermissions('testimonial:update'),
  validate({ params: idParamSchema, body: updateTestimonialSchema }),
  asyncHandler(testimonialController.update),
);

testimonialRouter.patch(
  '/:id/status',
  authenticate,
  requirePermissions('testimonial:update'),
  validate({ params: idParamSchema, body: setTestimonialStatusSchema }),
  asyncHandler(testimonialController.setStatus),
);

testimonialRouter.delete(
  '/:id',
  authenticate,
  requirePermissions('testimonial:delete'),
  validate({ params: idParamSchema }),
  asyncHandler(testimonialController.remove),
);

// ------------------------------------------------------------- public -------
testimonialRouter.get(
  '/',
  validate({ query: testimonialQuerySchema }),
  asyncHandler(testimonialController.listPublic),
);
