import type { Request, Response } from 'express';
import type { CategoryQuery, CreateCategoryInput, UpdateCategoryInput } from '@travel/types';
import { categoryService } from './category.service';
import { sendCreated, sendNoContent, sendPaginated, sendSuccess } from '../../lib/http';

export const categoryController = {
  async listPublic(req: Request, res: Response): Promise<void> {
    const result = await categoryService.listPublic(req.query as unknown as CategoryQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async listAdmin(req: Request, res: Response): Promise<void> {
    const result = await categoryService.listAdmin(req.query as unknown as CategoryQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const category = await categoryService.getById(id);
    sendSuccess(res, category);
  },

  async create(req: Request, res: Response): Promise<void> {
    const category = await categoryService.create(req.body as CreateCategoryInput);
    sendCreated(res, category, 'Category created successfully');
  },

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const category = await categoryService.update(id, req.body as UpdateCategoryInput);
    sendSuccess(res, category, 'Category updated successfully');
  },

  async remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    await categoryService.remove(id);
    sendNoContent(res);
  },
};
