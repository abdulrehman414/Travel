import type { Request, Response } from 'express';
import type {
  AdminReviewQuery,
  CreateReviewInput,
  PublicReviewQuery,
  SetReviewStatusInput,
} from '@travel/types';
import { reviewService } from './review.service';
import { sendCreated, sendNoContent, sendPaginated, sendSuccess } from '../../lib/http';
import { UnauthorizedError } from '../../lib/api-error';

export const reviewController = {
  async listPublic(req: Request, res: Response): Promise<void> {
    const result = await reviewService.listPublic(req.query as unknown as PublicReviewQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async listAdmin(req: Request, res: Response): Promise<void> {
    const result = await reviewService.listAdmin(req.query as unknown as AdminReviewQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const review = await reviewService.create(req.body as CreateReviewInput, req.user.id);
    sendCreated(res, review, 'Review submitted and awaiting moderation');
  },

  async setStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const { status } = req.body as SetReviewStatusInput;
    sendSuccess(res, await reviewService.setStatus(id, status), 'Review status updated');
  },

  async remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    await reviewService.remove(id);
    sendNoContent(res);
  },
};
