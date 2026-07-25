import type { Request, Response } from 'express';
import type { CreateTagInput, TagQuery, UpdateTagInput } from '@travel/types';
import { tagService } from './tag.service';
import { sendCreated, sendNoContent, sendPaginated, sendSuccess } from '../../lib/http';

export const tagController = {
  async listPublic(req: Request, res: Response): Promise<void> {
    const result = await tagService.listPublic(req.query as unknown as TagQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async listAdmin(req: Request, res: Response): Promise<void> {
    const result = await tagService.listAdmin(req.query as unknown as TagQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async getBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = req.params as { slug: string };
    const tag = await tagService.getBySlug(slug);
    sendSuccess(res, tag);
  },

  async create(req: Request, res: Response): Promise<void> {
    const tag = await tagService.create(req.body as CreateTagInput);
    sendCreated(res, tag, 'Tag created successfully');
  },

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const tag = await tagService.update(id, req.body as UpdateTagInput);
    sendSuccess(res, tag, 'Tag updated successfully');
  },

  async remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    await tagService.remove(id);
    sendNoContent(res);
  },
};
