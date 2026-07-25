import type { Request, Response } from 'express';
import type { SetUserRolesInput, UpdateUserInput, UserQuery } from '@travel/types';
import { userService } from './user.service';
import { sendNoContent, sendPaginated, sendSuccess } from '../../lib/http';

export const userController = {
  async list(req: Request, res: Response): Promise<void> {
    const result = await userService.list(req.query as unknown as UserQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const user = await userService.getById(id);
    sendSuccess(res, user);
  },

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const user = await userService.update(id, req.body as UpdateUserInput);
    sendSuccess(res, user, 'User updated successfully');
  },

  async setRoles(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const user = await userService.setRoles(id, req.body as SetUserRolesInput);
    sendSuccess(res, user, 'User roles updated');
  },

  async remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    await userService.remove(id);
    sendNoContent(res);
  },
};
