import type { Request, Response } from 'express';
import type { CreateTransportInput, TransportQuery, UpdateTransportInput } from '@travel/types';
import { transportService } from './transport.service';
import { sendCreated, sendNoContent, sendPaginated, sendSuccess } from '../../lib/http';

export const transportController = {
  async listPublic(req: Request, res: Response): Promise<void> {
    const result = await transportService.list(req.query as unknown as TransportQuery, {
      onlyActive: true,
    });
    sendPaginated(res, result.items, result.meta);
  },

  async listAdmin(req: Request, res: Response): Promise<void> {
    const result = await transportService.list(req.query as unknown as TransportQuery, {
      onlyActive: false,
    });
    sendPaginated(res, result.items, result.meta);
  },

  async getBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = req.params as { slug: string };
    sendSuccess(res, await transportService.getBySlug(slug, true));
  },

  async create(req: Request, res: Response): Promise<void> {
    sendCreated(res, await transportService.create(req.body as CreateTransportInput), 'Service created');
  },

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    sendSuccess(res, await transportService.update(id, req.body as UpdateTransportInput), 'Service updated');
  },

  async remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    await transportService.remove(id);
    sendNoContent(res);
  },
};
