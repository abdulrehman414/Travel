import { Router, type Request, type Response } from 'express';
import { auditQuerySchema, type AuditQuery } from '@travel/types';
import { auditService } from './audit.service';
import { asyncHandler } from '../../lib/async-handler';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { requirePermissions } from '../../middleware/authorize';
import { sendPaginated } from '../../lib/http';

export const auditRouter: Router = Router();

auditRouter.get(
  '/admin/list',
  authenticate,
  requirePermissions('auditlog:read'),
  validate({ query: auditQuerySchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await auditService.list(req.query as unknown as AuditQuery);
    sendPaginated(res, result.items, result.meta);
  }),
);
