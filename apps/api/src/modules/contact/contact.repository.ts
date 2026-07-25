import { prisma, type Prisma } from '@travel/db';
import type { ContactQuery } from '@travel/types';

export type ContactRow = Prisma.ContactMessageGetPayload<object>;

export const contactRepository = {
  create(data: Prisma.ContactMessageUncheckedCreateInput): Promise<ContactRow> {
    return prisma.contactMessage.create({ data });
  },

  findById(id: string): Promise<ContactRow | null> {
    return prisma.contactMessage.findUnique({ where: { id } });
  },

  update(id: string, data: Prisma.ContactMessageUncheckedUpdateInput): Promise<ContactRow> {
    return prisma.contactMessage.update({ where: { id }, data });
  },

  delete(id: string): Promise<unknown> {
    return prisma.contactMessage.delete({ where: { id } });
  },

  async list(query: ContactQuery): Promise<{ rows: ContactRow[]; total: number }> {
    const where: Prisma.ContactMessageWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { subject: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const skip = (query.page - 1) * query.limit;
    const [rows, total] = await prisma.$transaction([
      prisma.contactMessage.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: query.limit }),
      prisma.contactMessage.count({ where }),
    ]);
    return { rows, total };
  },
};
