import { prisma, type Prisma } from '@travel/db';
import type { PostQuery } from '@travel/types';

const refSelect = { id: true, slug: true, nameEn: true, nameAr: true } as const;

const postInclude = {
  author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
  category: { select: refSelect },
  tags: { include: { tag: { select: refSelect } } },
} satisfies Prisma.PostInclude;

export type PostRow = Prisma.PostGetPayload<{ include: typeof postInclude }>;

const SORT_FIELDS: Record<string, keyof Prisma.PostOrderByWithRelationInput> = {
  publishedAt: 'publishedAt',
  createdAt: 'createdAt',
  title: 'titleEn',
  views: 'views',
};

function buildWhere(query: PostQuery, onlyPublished: boolean): Prisma.PostWhereInput {
  const where: Prisma.PostWhereInput = {};
  if (onlyPublished) where.status = 'PUBLISHED';
  else if (query.status) where.status = query.status;
  if (query.categoryId) where.categoryId = query.categoryId;
  if (query.tag) where.tags = { some: { tag: { slug: query.tag } } };
  if (query.search) {
    where.OR = [
      { titleEn: { contains: query.search, mode: 'insensitive' } },
      { titleAr: { contains: query.search } },
      { excerptEn: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  return where;
}

export interface PostNestedReplace {
  tagIds?: string[];
}

export const postRepository = {
  async list(
    query: PostQuery,
    options: { onlyPublished: boolean },
  ): Promise<{ rows: PostRow[]; total: number }> {
    const where = buildWhere(query, options.onlyPublished);
    const sortField = SORT_FIELDS[query.sort ?? ''] ?? (options.onlyPublished ? 'publishedAt' : 'createdAt');
    const orderBy: Prisma.PostOrderByWithRelationInput = { [sortField]: query.order };
    const skip = (query.page - 1) * query.limit;

    const [rows, total] = await prisma.$transaction([
      prisma.post.findMany({ where, include: postInclude, orderBy, skip, take: query.limit }),
      prisma.post.count({ where }),
    ]);
    return { rows, total };
  },

  findBySlugPublished(slug: string): Promise<PostRow | null> {
    return prisma.post.findFirst({ where: { slug, status: 'PUBLISHED' }, include: postInclude });
  },

  findById(id: string): Promise<PostRow | null> {
    return prisma.post.findUnique({ where: { id }, include: postInclude });
  },

  create(data: Prisma.PostUncheckedCreateInput): Promise<PostRow> {
    return prisma.post.create({ data, include: postInclude });
  },

  async update(
    id: string,
    scalar: Prisma.PostUncheckedUpdateInput,
    nested: PostNestedReplace,
  ): Promise<PostRow | null> {
    return prisma.$transaction(async (tx) => {
      if (nested.tagIds) {
        await tx.postTag.deleteMany({ where: { postId: id } });
        if (nested.tagIds.length) {
          await tx.postTag.createMany({
            data: nested.tagIds.map((tagId) => ({ postId: id, tagId })),
          });
        }
      }
      await tx.post.update({ where: { id }, data: scalar });
      return tx.post.findUnique({ where: { id }, include: postInclude });
    });
  },

  setStatus(id: string, status: Prisma.PostUpdateInput['status'], publishedAt?: Date): Promise<PostRow> {
    return prisma.post.update({
      where: { id },
      data: { status, ...(publishedAt ? { publishedAt } : {}) },
      include: postInclude,
    });
  },

  incrementViews(id: string): Promise<unknown> {
    return prisma.post.update({ where: { id }, data: { views: { increment: 1 } } });
  },

  delete(id: string): Promise<unknown> {
    return prisma.post.delete({ where: { id } });
  },
};
