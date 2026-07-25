import type { Request, Response } from 'express';
import type { ContactQuery, CreateContactInput, UpdateContactStatusInput } from '@travel/types';
import { contactService } from './contact.service';
import { sendCreated, sendNoContent, sendPaginated, sendSuccess } from '../../lib/http';

export const contactController = {
  async create(req: Request, res: Response): Promise<void> {
    // optionalAuthenticate may have attached req.user.
    const message = await contactService.create(req.body as CreateContactInput, req.user?.id);
    sendCreated(res, message, 'Thank you — we will be in touch shortly');
  },

  async list(req: Request, res: Response): Promise<void> {
    const result = await contactService.list(req.query as unknown as ContactQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async getById(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await contactService.getById((req.params as { id: string }).id));
  },

  async setStatus(req: Request, res: Response): Promise<void> {
    const id = (req.params as { id: string }).id;
    const { status } = req.body as UpdateContactStatusInput;
    sendSuccess(res, await contactService.setStatus(id, status), 'Status updated');
  },

  async remove(req: Request, res: Response): Promise<void> {
    await contactService.remove((req.params as { id: string }).id);
    sendNoContent(res);
  },
};
