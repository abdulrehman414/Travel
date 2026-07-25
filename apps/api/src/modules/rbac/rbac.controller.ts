import type { Request, Response } from 'express';
import type { CreateRoleInput, SetRolePermissionsInput, UpdateRoleInput } from '@travel/types';
import { rbacService } from './rbac.service';
import { auditService } from '../audit/audit.service';
import { sendCreated, sendNoContent, sendSuccess } from '../../lib/http';

export const rbacController = {
  async listRoles(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, await rbacService.listRoles());
  },

  async getRole(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await rbacService.getRole((req.params as { id: string }).id));
  },

  async createRole(req: Request, res: Response): Promise<void> {
    const role = await rbacService.createRole(req.body as CreateRoleInput);
    auditService.record({
      userId: req.user?.id,
      action: 'role.created',
      entity: 'Role',
      entityId: role.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { slug: role.slug },
    });
    sendCreated(res, role, 'Role created');
  },

  async updateRole(req: Request, res: Response): Promise<void> {
    const id = (req.params as { id: string }).id;
    sendSuccess(res, await rbacService.updateRole(id, req.body as UpdateRoleInput), 'Role updated');
  },

  async setPermissions(req: Request, res: Response): Promise<void> {
    const id = (req.params as { id: string }).id;
    const role = await rbacService.setPermissions(id, req.body as SetRolePermissionsInput);
    sendSuccess(res, role, 'Permissions updated');
  },

  async deleteRole(req: Request, res: Response): Promise<void> {
    const id = (req.params as { id: string }).id;
    await rbacService.deleteRole(id);
    auditService.record({
      userId: req.user?.id,
      action: 'role.deleted',
      entity: 'Role',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    sendNoContent(res);
  },

  async listPermissions(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, await rbacService.listPermissions());
  },
};
