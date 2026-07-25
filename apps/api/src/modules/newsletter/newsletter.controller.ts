import type { Request, Response } from 'express';
import type {
  NewsletterQuery,
  SubscribeNewsletterInput,
  UnsubscribeNewsletterInput,
} from '@travel/types';
import { newsletterService } from './newsletter.service';
import { sendCreated, sendNoContent, sendPaginated, sendSuccess } from '../../lib/http';

export const newsletterController = {
  async subscribe(req: Request, res: Response): Promise<void> {
    const sub = await newsletterService.subscribe(req.body as SubscribeNewsletterInput);
    sendCreated(res, sub, 'Subscribed successfully');
  },

  async unsubscribe(req: Request, res: Response): Promise<void> {
    const { email } = req.body as UnsubscribeNewsletterInput;
    sendSuccess(res, await newsletterService.unsubscribe(email), 'Unsubscribed');
  },

  async list(req: Request, res: Response): Promise<void> {
    const result = await newsletterService.list(req.query as unknown as NewsletterQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async remove(req: Request, res: Response): Promise<void> {
    await newsletterService.remove((req.params as { id: string }).id);
    sendNoContent(res);
  },
};
