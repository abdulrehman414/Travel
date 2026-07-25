import { Router } from 'express';
import { prisma } from '@travel/db';
import { asyncHandler } from '../../lib/async-handler';
import { sendSuccess } from '../../lib/http';

export const healthRouter: Router = Router();

/** Liveness — does not touch the database. */
healthRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    sendSuccess(res, {
      status: 'ok',
      service: 'saudi-luxury-travel-api',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }),
);

/** Readiness — verifies database connectivity. */
healthRouter.get(
  '/db',
  asyncHandler(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    sendSuccess(res, { status: 'ok', database: 'connected' });
  }),
);
