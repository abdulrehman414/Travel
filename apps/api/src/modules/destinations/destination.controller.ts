import type { Request, Response } from 'express';
import type {
  CreateDestinationInput,
  DestinationQuery,
  UpdateDestinationInput,
} from '@travel/types';
import { destinationService } from './destination.service';
import { sendCreated, sendNoContent, sendPaginated, sendSuccess } from '../../lib/http';

export const destinationController = {
  async listPublic(req: Request, res: Response): Promise<void> {
    const result = await destinationService.listPublic(req.query as unknown as DestinationQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async listAdmin(req: Request, res: Response): Promise<void> {
    const result = await destinationService.listAdmin(req.query as unknown as DestinationQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async getBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = req.params as { slug: string };
    const destination = await destinationService.getBySlug(slug);
    sendSuccess(res, destination);
  },

  async getByIdAdmin(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const destination = await destinationService.getByIdAdmin(id);
    sendSuccess(res, destination);
  },

  async create(req: Request, res: Response): Promise<void> {
    const destination = await destinationService.create(req.body as CreateDestinationInput);
    sendCreated(res, destination, 'Destination created successfully');
  },

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const destination = await destinationService.update(id, req.body as UpdateDestinationInput);
    sendSuccess(res, destination, 'Destination updated successfully');
  },

  async remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    await destinationService.remove(id);
    sendNoContent(res);
  },
};
