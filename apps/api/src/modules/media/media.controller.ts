import type { Request, Response } from 'express';
import type { MediaQuery } from '@travel/types';
import { mediaService } from './media.service';
import { sendCreated, sendNoContent, sendPaginated } from '../../lib/http';
import { BadRequestError, UnauthorizedError } from '../../lib/api-error';

export const mediaController = {
  async upload(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    if (!req.file) throw new BadRequestError('No file provided (expected field "file")');
    const body = req.body as { folder?: string; altEn?: string; altAr?: string };
    const media = await mediaService.upload(req.file, req.user.id, {
      folder: body.folder,
      altEn: body.altEn,
      altAr: body.altAr,
    });
    sendCreated(res, media, 'File uploaded');
  },

  async list(req: Request, res: Response): Promise<void> {
    const result = await mediaService.list(req.query as unknown as MediaQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async remove(req: Request, res: Response): Promise<void> {
    await mediaService.remove((req.params as { id: string }).id);
    sendNoContent(res);
  },
};
