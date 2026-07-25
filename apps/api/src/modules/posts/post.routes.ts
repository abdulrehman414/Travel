import { Router } from 'express';
import {
  createPostSchema,
  idParamSchema,
  postQuerySchema,
  setPostStatusSchema,
  slugParamSchema,
  updatePostSchema,
} from '@travel/types';
import { postController } from './post.controller';
import { asyncHandler } from '../../lib/async-handler';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { requirePermissions } from '../../middleware/authorize';

export const postRouter: Router = Router();

// Admin (literal routes before public '/:slug').
postRouter.get(
  '/admin/list',
  authenticate,
  requirePermissions('post:read'),
  validate({ query: postQuerySchema }),
  asyncHandler(postController.listAdmin),
);

postRouter.get(
  '/admin/:id',
  authenticate,
  requirePermissions('post:read'),
  validate({ params: idParamSchema }),
  asyncHandler(postController.getByIdAdmin),
);

postRouter.post(
  '/',
  authenticate,
  requirePermissions('post:create'),
  validate({ body: createPostSchema }),
  asyncHandler(postController.create),
);

postRouter.put(
  '/:id',
  authenticate,
  requirePermissions('post:update'),
  validate({ params: idParamSchema, body: updatePostSchema }),
  asyncHandler(postController.update),
);

postRouter.patch(
  '/:id/status',
  authenticate,
  requirePermissions('post:update'),
  validate({ params: idParamSchema, body: setPostStatusSchema }),
  asyncHandler(postController.setStatus),
);

postRouter.delete(
  '/:id',
  authenticate,
  requirePermissions('post:delete'),
  validate({ params: idParamSchema }),
  asyncHandler(postController.remove),
);

// Public.
postRouter.get('/', validate({ query: postQuerySchema }), asyncHandler(postController.listPublic));
postRouter.get(
  '/:slug',
  validate({ params: slugParamSchema }),
  asyncHandler(postController.getBySlug),
);
