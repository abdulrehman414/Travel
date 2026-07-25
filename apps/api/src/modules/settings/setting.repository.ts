import { prisma, type Prisma } from '@travel/db';
import type { SettingQuery } from '@travel/types';

export const settingRepository = {
  async list(query: SettingQuery): Promise<{ rows: Prisma.SettingGetPayload<object>[]; total: number }> {
    const where: Prisma.SettingWhereInput = {};
    if (query.group) where.group = query.group;
    if (query.search) where.key = { contains: query.search, mode: 'insensitive' };

    const skip = (query.page - 1) * query.limit;
    const [rows, total] = await prisma.$transaction([
      prisma.setting.findMany({ where, orderBy: { key: 'asc' }, skip, take: query.limit }),
      prisma.setting.count({ where }),
    ]);
    return { rows, total };
  },

  findByKey(key: string) {
    return prisma.setting.findUnique({ where: { key } });
  },

  findByGroups(groups: string[]) {
    return prisma.setting.findMany({ where: { group: { in: groups } } });
  },

  upsert(key: string, value: Prisma.InputJsonValue, group?: string) {
    return prisma.setting.upsert({
      where: { key },
      update: { value, ...(group ? { group } : {}) },
      create: { key, value, group: group ?? 'general' },
    });
  },

  delete(key: string) {
    return prisma.setting.delete({ where: { key } });
  },

  async exists(key: string): Promise<boolean> {
    const count = await prisma.setting.count({ where: { key } });
    return count > 0;
  },
};
