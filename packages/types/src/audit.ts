import { z } from 'zod';
import { paginationQuerySchema } from './common';

export const auditQuerySchema = paginationQuerySchema.extend({
  entity: z.string().optional(),
  action: z.string().optional(),
  userId: z.string().optional(),
});
export type AuditQuery = z.infer<typeof auditQuerySchema>;

export interface AuditLogDto {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  ipAddress: string | null;
  metadata: unknown;
  createdAt: string;
}
