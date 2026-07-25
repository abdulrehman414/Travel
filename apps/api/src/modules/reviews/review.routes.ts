import { Router } from 'express';
import {
  adminReviewQuerySchema,
  createReviewSchema,
  idParamSchema,
  publicReviewQuerySchema,
  setReviewStatusSchema,
} from '@travel/types';
import { reviewController } from './review.controller';
import { asyncHandler } from '../../lib/async-handler';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { requirePermissions } from '../../middleware/authorize';

export const reviewRouter: Router = Router();

// Public: reviews for a package (requires ?packageId=).
reviewRouter.get(
  '/',
  validate({ query: publicReviewQuerySchema }),
  asyncHandler(reviewController.listPublic),
);

// Authenticated customer: submit a review (no special permission).
reviewRouter.post(
  '/',
  authenticate,
  validate({ body: createReviewSchema }),
  asyncHandler(reviewController.create),
);

// Admin moderation.
reviewRouter.get(
  '/admin/list',
  authenticate,
  requirePermissions('review:read'),
  validate({ query: adminReviewQuerySchema }),
  asyncHandler(reviewController.listAdmin),
);

reviewRouter.patch(
  '/:id/status',
  authenticate,
  requirePermissions('review:update'),
  validate({ params: idParamSchema, body: setReviewStatusSchema }),
  asyncHandler(reviewController.setStatus),
);

reviewRouter.delete(
  '/:id',
  authenticate,
  requirePermissions('review:delete'),
  validate({ params: idParamSchema }),
  asyncHandler(reviewController.remove),
);
