import type { Request, Response } from 'express';
import type { CreatePostInput, PostQuery, SetPostStatusInput, UpdatePostInput } from '@travel/types';
import { postService } from './post.service';
import { sendCreated, sendNoContent, sendPaginated, sendSuccess } from '../../lib/http';
import { UnauthorizedError } from '../../lib/api-error';

export const postController = {
  async listPublic(req: Request, res: Response): Promise<void> {
    const result = await postService.listPublic(req.query as unknown as PostQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async listAdmin(req: Request, res: Response): Promise<void> {
    const result = await postService.listAdmin(req.query as unknown as PostQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async getBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = req.params as { slug: string };
    sendSuccess(res, await postService.getBySlug(slug));
  },

  async getByIdAdmin(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    sendSuccess(res, await postService.getByIdAdmin(id));
  },

  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const post = await postService.create(req.body as CreatePostInput, req.user.id);
    sendCreated(res, post, 'Post created successfully');
  },

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const post = await postService.update(id, req.body as UpdatePostInput);
    sendSuccess(res, post, 'Post updated successfully');
  },

  async setStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const { status } = req.body as SetPostStatusInput;
    sendSuccess(res, await postService.setStatus(id, status), 'Post status updated');
  },

  async remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    await postService.remove(id);
    sendNoContent(res);
  },
};
