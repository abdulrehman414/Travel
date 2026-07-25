import { prisma, type Prisma } from '@travel/db';
import type { AdminReviewQuery, PublicReviewQuery } from '@travel/types';

const reviewInclude = {
  user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
  package: { select: { id: true, slug: true, titleEn: true, titleAr: true } },
} satisfies Prisma.ReviewInclude;

export type ReviewRow = Prisma.ReviewGetPayload<{ include: typeof reviewInclude }>;

export interface CreateReviewData {
  packageId: string;
  userId: string;
  rating: number;
  titleEn?: string;
  comment: string;
}

export const reviewRepository = {
  async listPublic(query: PublicReviewQuery): Promise<{ rows: ReviewRow[]; total: number }> {
    const where: Prisma.ReviewWhereInput = { packageId: query.packageId, status: 'APPROVED' };
    const skip = (query.page - 1) * query.limit;
    const [rows, total] = await prisma.$transaction([
      prisma.review.findMany({
        where,
        include: reviewInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.review.count({ where }),
    ]);
    return { rows, total };
  },

  async listAdmin(query: AdminReviewQuery): Promise<{ rows: ReviewRow[]; total: number }> {
    const where: Prisma.ReviewWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.packageId) where.packageId = query.packageId;
    const skip = (query.page - 1) * query.limit;
    const [rows, total] = await prisma.$transaction([
      prisma.review.findMany({
        where,
        include: reviewInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.review.count({ where }),
    ]);
    return { rows, total };
  },

  create(data: CreateReviewData): Promise<ReviewRow> {
    return prisma.review.create({ data, include: reviewInclude });
  },

  findById(id: string): Promise<ReviewRow | null> {
    return prisma.review.findUnique({ where: { id }, include: reviewInclude });
  },

  setStatus(id: string, status: Prisma.ReviewUpdateInput['status']): Promise<ReviewRow> {
    return prisma.review.update({ where: { id }, data: { status }, include: reviewInclude });
  },

  delete(id: string): Promise<unknown> {
    return prisma.review.delete({ where: { id } });
  },

  /** Recomputes a package's aggregate rating from its APPROVED reviews. */
  async recomputePackageRating(packageId: string): Promise<void> {
    const agg = await prisma.review.aggregate({
      where: { packageId, status: 'APPROVED' },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.package.update({
      where: { id: packageId },
      data: {
        rating: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0,
        reviewCount: agg._count,
      },
    });
  },
};
