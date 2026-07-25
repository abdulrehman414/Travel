import { Router, type Request, type Response } from 'express';
import { analyticsService } from './analytics.service';
import { asyncHandler } from '../../lib/async-handler';
import { authenticate } from '../../middleware/authenticate';
import { requirePermissions } from '../../middleware/authorize';
import { sendSuccess } from '../../lib/http';

export const analyticsRouter: Router = Router();

analyticsRouter.get(
  '/dashboard',
  authenticate,
  requirePermissions('dashboard:read'),
  asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, await analyticsService.getDashboard());
  }),
);
