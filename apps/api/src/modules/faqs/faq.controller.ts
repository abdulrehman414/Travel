import type { Request, Response } from 'express';
import type { CreateFaqInput, FaqQuery, UpdateFaqInput } from '@travel/types';
import { faqService } from './faq.service';
import { sendCreated, sendNoContent, sendPaginated, sendSuccess } from '../../lib/http';

export const faqController = {
  async listPublic(req: Request, res: Response): Promise<void> {
    const result = await faqService.listPublic(req.query as unknown as FaqQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async listAdmin(req: Request, res: Response): Promise<void> {
    const result = await faqService.listAdmin(req.query as unknown as FaqQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async create(req: Request, res: Response): Promise<void> {
    const faq = await faqService.create(req.body as CreateFaqInput);
    sendCreated(res, faq, 'Faq created successfully');
  },

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const faq = await faqService.update(id, req.body as UpdateFaqInput);
    sendSuccess(res, faq, 'Faq updated successfully');
  },

  async remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    await faqService.remove(id);
    sendNoContent(res);
  },
};
