import { prisma, type Prisma } from '@travel/db';
import type { MediaQuery } from '@travel/types';

export type MediaRow = Prisma.MediaGetPayload<object>;

export const mediaRepository = {
  create(data: Prisma.MediaUncheckedCreateInput): Promise<MediaRow> {
    return prisma.media.create({ data });
  },

  findById(id: string): Promise<MediaRow | null> {
    return prisma.media.findUnique({ where: { id } });
  },

  delete(id: string): Promise<unknown> {
    return prisma.media.delete({ where: { id } });
  },

  async list(query: MediaQuery): Promise<{ rows: MediaRow[]; total: number }> {
    const where: Prisma.MediaWhereInput = {};
    if (query.type) where.type = query.type;
    if (query.folder) where.folder = query.folder;
    if (query.search) where.fileName = { contains: query.search, mode: 'insensitive' };
    const skip = (query.page - 1) * query.limit;
    const [rows, total] = await prisma.$transaction([
      prisma.media.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: query.limit }),
      prisma.media.count({ where }),
    ]);
    return { rows, total };
  },
};
