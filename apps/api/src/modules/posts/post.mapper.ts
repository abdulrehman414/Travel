import type { PostDetailDto, PostListItemDto, PostRefDto } from '@travel/types';
import type { PostRow } from './post.repository';

function toRefs(
  tags: PostRow['tags'],
): PostRefDto[] {
  return tags.map((postTag) => ({
    id: postTag.tag.id,
    slug: postTag.tag.slug,
    nameEn: postTag.tag.nameEn,
    nameAr: postTag.tag.nameAr,
  }));
}

export function toPostListItem(row: PostRow): PostListItemDto {
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    titleEn: row.titleEn,
    titleAr: row.titleAr,
    excerptEn: row.excerptEn,
    excerptAr: row.excerptAr,
    coverImageUrl: row.coverImageUrl,
    readMinutes: row.readMinutes,
    views: row.views,
    author: row.author
      ? {
          id: row.author.id,
          firstName: row.author.firstName,
          lastName: row.author.lastName,
          avatarUrl: row.author.avatarUrl,
        }
      : null,
    category: row.category
      ? { id: row.category.id, slug: row.category.slug, nameEn: row.category.nameEn, nameAr: row.category.nameAr }
      : null,
    tags: toRefs(row.tags),
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export function toPostDetail(row: PostRow): PostDetailDto {
  return {
    ...toPostListItem(row),
    contentEn: row.contentEn,
    contentAr: row.contentAr,
    metaTitleEn: row.metaTitleEn,
    metaTitleAr: row.metaTitleAr,
    metaDescriptionEn: row.metaDescriptionEn,
    metaDescriptionAr: row.metaDescriptionAr,
    updatedAt: row.updatedAt.toISOString(),
  };
}
