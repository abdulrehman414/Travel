import { prisma, type Prisma } from '@travel/db';
import { buildPageMeta } from '@travel/types';
import type { AuditLogDto, AuditQuery, Paginated } from '@travel/types';
import { logger } from '../../config/logger';

export interface AuditEntry {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

function toDto(row: Prisma.AuditLogGetPayload<object>): AuditLogDto {
  return {
    id: row.id,
    userId: row.userId,
    action: row.action,
    entity: row.entity,
    entityId: row.entityId,
    ipAddress: row.ipAddress,
    metadata: row.metadata,
    createdAt: row.createdAt.toISOString(),
  };
}

export const auditService = {
  /** Fire-and-forget audit write. Never throws into the calling flow. */
  record(entry: AuditEntry): void {
    prisma.auditLog
      .create({
        data: {
          userId: entry.userId,
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          metadata: (entry.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        },
      })
      .catch((error: unknown) => {
        logger.warn({ error, action: entry.action }, 'Failed to write audit log');
      });
  },

  async list(query: AuditQuery): Promise<Paginated<AuditLogDto>> {
    const where: Prisma.AuditLogWhereInput = {};
    if (query.entity) where.entity = query.entity;
    if (query.action) where.action = { contains: query.action, mode: 'insensitive' };
    if (query.userId) where.userId = query.userId;
    const skip = (query.page - 1) * query.limit;
    const [rows, total] = await prisma.$transaction([
      prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: query.limit }),
      prisma.auditLog.count({ where }),
    ]);
    return { items: rows.map(toDto), meta: buildPageMeta(total, query.page, query.limit) };
  },
};
