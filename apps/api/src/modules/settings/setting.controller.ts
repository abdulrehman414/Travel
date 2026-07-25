import type { Request, Response } from 'express';
import type { SettingQuery, UpsertSettingInput } from '@travel/types';
import { settingService } from './setting.service';
import { sendNoContent, sendPaginated, sendSuccess } from '../../lib/http';

export const settingController = {
  async getPublic(_req: Request, res: Response): Promise<void> {
    const settings = await settingService.getPublic();
    sendSuccess(res, settings);
  },

  async list(req: Request, res: Response): Promise<void> {
    const result = await settingService.list(req.query as unknown as SettingQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async getByKey(req: Request, res: Response): Promise<void> {
    const { key } = req.params as { key: string };
    sendSuccess(res, await settingService.getByKey(key));
  },

  async upsert(req: Request, res: Response): Promise<void> {
    const { key } = req.params as { key: string };
    const setting = await settingService.upsert(key, req.body as UpsertSettingInput);
    sendSuccess(res, setting, 'Setting saved');
  },

  async remove(req: Request, res: Response): Promise<void> {
    const { key } = req.params as { key: string };
    await settingService.remove(key);
    sendNoContent(res);
  },
};
