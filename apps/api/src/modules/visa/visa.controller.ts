import type { Request, Response } from 'express';
import type {
  AddVisaDocumentInput,
  CreateVisaRequestInput,
  UpdateVisaStatusInput,
  VisaQuery,
} from '@travel/types';
import { visaService } from './visa.service';
import { sendCreated, sendPaginated, sendSuccess } from '../../lib/http';
import { UnauthorizedError } from '../../lib/api-error';

const ADMIN_ROLES = ['super-admin', 'admin', 'support'];

function principal(req: Request): { id: string; isAdmin: boolean } {
  if (!req.user) throw new UnauthorizedError();
  return { id: req.user.id, isAdmin: req.user.roles.some((role) => ADMIN_ROLES.includes(role)) };
}

export const visaController = {
  async create(req: Request, res: Response): Promise<void> {
    const { id } = principal(req);
    sendCreated(res, await visaService.create(req.body as CreateVisaRequestInput, id), 'Visa request submitted');
  },

  async listOwn(req: Request, res: Response): Promise<void> {
    const { id } = principal(req);
    const result = await visaService.listOwn(id, req.query as unknown as VisaQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async listAdmin(req: Request, res: Response): Promise<void> {
    const result = await visaService.listAdmin(req.query as unknown as VisaQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async getOne(req: Request, res: Response): Promise<void> {
    const { id, isAdmin } = principal(req);
    const visaId = (req.params as { id: string }).id;
    sendSuccess(res, await visaService.getOne(visaId, id, isAdmin));
  },

  async addDocument(req: Request, res: Response): Promise<void> {
    const { id, isAdmin } = principal(req);
    const visaId = (req.params as { id: string }).id;
    const visa = await visaService.addDocument(visaId, id, isAdmin, req.body as AddVisaDocumentInput);
    sendCreated(res, visa, 'Document attached');
  },

  async updateStatus(req: Request, res: Response): Promise<void> {
    const visaId = (req.params as { id: string }).id;
    sendSuccess(res, await visaService.updateStatus(visaId, req.body as UpdateVisaStatusInput), 'Visa status updated');
  },
};
