import { buildPageMeta } from '@travel/types';
import type {
  CreatePostInput,
  Paginated,
  PostDetailDto,
  PostListItemDto,
  PostQuery,
  PostStatus,
  UpdatePostInput,
} from '@travel/types';
import type { Prisma } from '@travel/db';
import { postRepository, type PostNestedReplace } from './post.repository';
import { toPostDetail, toPostListItem } from './post.mapper';
import { ConflictError, NotFoundError } from '../../lib/api-error';
import { logger } from '../../config/logger';

function isUniqueSlugError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002'
  );
}

function toCreateData(input: CreatePostInput, authorId: string): Prisma.PostUncheckedCreateInput {
  return {
    slug: input.slug,
    status: input.status,
    titleEn: input.titleEn,
    titleAr: input.titleAr,
    excerptEn: input.excerptEn,
    excerptAr: input.excerptAr,
    contentEn: input.contentEn,
    contentAr: input.contentAr,
    coverImageUrl: input.coverImageUrl,
    readMinutes: input.readMinutes,
    authorId,
    categoryId: input.categoryId,
    metaTitleEn: input.metaTitleEn,
    metaTitleAr: input.metaTitleAr,
    metaDescriptionEn: input.metaDescriptionEn,
    metaDescriptionAr: input.metaDescriptionAr,
    publishedAt: input.status === 'PUBLISHED' ? new Date() : null,
    ...(input.tagIds ? { tags: { create: input.tagIds.map((tagId) => ({ tagId })) } } : {}),
  };
}

export const postService = {
  async listPublic(query: PostQuery): Promise<Paginated<PostListItemDto>> {
    const { rows, total } = await postRepository.list(query, { onlyPublished: true });
    return { items: rows.map(toPostListItem), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async listAdmin(query: PostQuery): Promise<Paginated<PostListItemDto>> {
    const { rows, total } = await postRepository.list(query, { onlyPublished: false });
    return { items: rows.map(toPostListItem), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async getBySlug(slug: string): Promise<PostDetailDto> {
    const row = await postRepository.findBySlugPublished(slug);
    if (!row) throw new NotFoundError('Post not found');
    // Fire-and-forget: a PrismaPromise is lazy, so .catch() is what actually
    // triggers execution (a bare `void` would never run the query).
    postRepository.incrementViews(row.id).catch((error: unknown) => {
      logger.warn({ error, postId: row.id }, 'Failed to increment post views');
    });
    return toPostDetail(row);
  },

  async getByIdAdmin(id: string): Promise<PostDetailDto> {
    const row = await postRepository.findById(id);
    if (!row) throw new NotFoundError('Post not found');
    return toPostDetail(row);
  },

  async create(input: CreatePostInput, authorId: string): Promise<PostDetailDto> {
    try {
      const row = await postRepository.create(toCreateData(input, authorId));
      return toPostDetail(row);
    } catch (error) {
      if (isUniqueSlugError(error)) throw new ConflictError('A post with this slug already exists');
      throw error;
    }
  },

  async update(id: string, input: UpdatePostInput): Promise<PostDetailDto> {
    const existing = await postRepository.findById(id);
    if (!existing) throw new NotFoundError('Post not found');

    const { tagIds, status, ...rest } = input;
    const scalar: Prisma.PostUncheckedUpdateInput = { ...rest };
    if (status !== undefined) {
      scalar.status = status;
      if (status === 'PUBLISHED' && !existing.publishedAt) scalar.publishedAt = new Date();
    }
    const nested: PostNestedReplace = { tagIds };

    try {
      const row = await postRepository.update(id, scalar, nested);
      if (!row) throw new NotFoundError('Post not found');
      return toPostDetail(row);
    } catch (error) {
      if (isUniqueSlugError(error)) throw new ConflictError('A post with this slug already exists');
      throw error;
    }
  },

  async setStatus(id: string, status: PostStatus): Promise<PostDetailDto> {
    const existing = await postRepository.findById(id);
    if (!existing) throw new NotFoundError('Post not found');
    const publishedAt = status === 'PUBLISHED' && !existing.publishedAt ? new Date() : undefined;
    const row = await postRepository.setStatus(id, status, publishedAt);
    return toPostDetail(row);
  },

  async remove(id: string): Promise<void> {
    const existing = await postRepository.findById(id);
    if (!existing) throw new NotFoundError('Post not found');
    await postRepository.delete(id);
  },
};
