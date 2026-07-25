import type { CategoryDto, CategoryRefDto } from '@travel/types';
import type { CategoryRow } from './category.repository';

function toRef(ref: CategoryRow['parent']): CategoryRefDto | null {
  return ref
    ? { id: ref.id, kind: ref.kind, slug: ref.slug, nameEn: ref.nameEn, nameAr: ref.nameAr }
    : null;
}

export function toCategory(row: CategoryRow): CategoryDto {
  return {
    id: row.id,
    kind: row.kind,
    slug: row.slug,
    nameEn: row.nameEn,
    nameAr: row.nameAr,
    descriptionEn: row.descriptionEn,
    descriptionAr: row.descriptionAr,
    imageUrl: row.imageUrl,
    parentId: row.parentId,
    order: row.order,
    parent: toRef(row.parent),
    childrenCount: row._count.children,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
