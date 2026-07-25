import { prisma, type Prisma } from '@travel/db';
import type { VisaQuery } from '@travel/types';

const visaInclude = {
  documents: { orderBy: { uploadedAt: 'asc' } },
} satisfies Prisma.VisaRequestInclude;

export type VisaRow = Prisma.VisaRequestGetPayload<{ include: typeof visaInclude }>;

export const visaRepository = {
  create(data: Prisma.VisaRequestUncheckedCreateInput): Promise<VisaRow> {
    return prisma.visaRequest.create({ data, include: visaInclude });
  },

  findById(id: string): Promise<VisaRow | null> {
    return prisma.visaRequest.findUnique({ where: { id }, include: visaInclude });
  },

  update(id: string, data: Prisma.VisaRequestUncheckedUpdateInput): Promise<VisaRow> {
    return prisma.visaRequest.update({ where: { id }, data, include: visaInclude });
  },

  addDocument(data: Prisma.VisaDocumentUncheckedCreateInput): Promise<unknown> {
    return prisma.visaDocument.create({ data });
  },

  async listByUser(userId: string, query: VisaQuery): Promise<{ rows: VisaRow[]; total: number }> {
    const where: Prisma.VisaRequestWhereInput = { userId };
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    return this.paginate(where, query);
  },

  async listAll(query: VisaQuery): Promise<{ rows: VisaRow[]; total: number }> {
    const where: Prisma.VisaRequestWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.search) {
      where.OR = [
        { reference: { contains: query.search, mode: 'insensitive' } },
        { applicantLastName: { contains: query.search, mode: 'insensitive' } },
        { passportNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    return this.paginate(where, query);
  },

  async paginate(
    where: Prisma.VisaRequestWhereInput,
    query: VisaQuery,
  ): Promise<{ rows: VisaRow[]; total: number }> {
    const skip = (query.page - 1) * query.limit;
    const [rows, total] = await prisma.$transaction([
      prisma.visaRequest.findMany({
        where,
        include: visaInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.visaRequest.count({ where }),
    ]);
    return { rows, total };
  },
};
