import type { Request, Response } from 'express';
import type {
  CreatePackageInput,
  PackageQuery,
  SetPackageStatusInput,
  UpdatePackageInput,
} from '@travel/types';
import { packageService } from './package.service';
import { sendCreated, sendNoContent, sendPaginated, sendSuccess } from '../../lib/http';

export const packageController = {
  async listPublic(req: Request, res: Response): Promise<void> {
    const result = await packageService.listPublic(req.query as unknown as PackageQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async listAdmin(req: Request, res: Response): Promise<void> {
    const result = await packageService.listAdmin(req.query as unknown as PackageQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async getBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = req.params as { slug: string };
    const pkg = await packageService.getBySlug(slug);
    sendSuccess(res, pkg);
  },

  async getByIdAdmin(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const pkg = await packageService.getByIdAdmin(id);
    sendSuccess(res, pkg);
  },

  async create(req: Request, res: Response): Promise<void> {
    const pkg = await packageService.create(req.body as CreatePackageInput);
    sendCreated(res, pkg, 'Package created successfully');
  },

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const pkg = await packageService.update(id, req.body as UpdatePackageInput);
    sendSuccess(res, pkg, 'Package updated successfully');
  },

  async setStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const { status } = req.body as SetPackageStatusInput;
    const pkg = await packageService.setStatus(id, status);
    sendSuccess(res, pkg, 'Package status updated');
  },

  async remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    await packageService.remove(id);
    sendNoContent(res);
  },
};
