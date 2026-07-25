import { buildPageMeta } from '@travel/types';
import type {
  CategoryDto,
  CategoryQuery,
  CreateCategoryInput,
  Paginated,
  UpdateCategoryInput,
} from '@travel/types';
import type { Prisma } from '@travel/db';
import { categoryRepository } from './category.repository';
import { toCategory } from './category.mapper';
import { ConflictError, NotFoundError } from '../../lib/api-error';

function toCreateData(input: CreateCategoryInput): Prisma.CategoryUncheckedCreateInput {
  return {
    kind: input.kind,
    slug: input.slug,
    nameEn: input.nameEn,
    nameAr: input.nameAr,
    descriptionEn: input.descriptionEn,
    descriptionAr: input.descriptionAr,
    imageUrl: input.imageUrl,
    parentId: input.parentId,
    order: input.order,
  };
}

export const categoryService = {
  async listPublic(query: CategoryQuery): Promise<Paginated<CategoryDto>> {
    const { rows, total } = await categoryRepository.list(query);
    return { items: rows.map(toCategory), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async listAdmin(query: CategoryQuery): Promise<Paginated<CategoryDto>> {
    const { rows, total } = await categoryRepository.list(query);
    return { items: rows.map(toCategory), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async getById(id: string): Promise<CategoryDto> {
    const row = await categoryRepository.findById(id);
    if (!row) throw new NotFoundError('Category not found');
    return toCategory(row);
  },

  async create(input: CreateCategoryInput): Promise<CategoryDto> {
    try {
      const row = await categoryRepository.create(toCreateData(input));
      return toCategory(row);
    } catch (error) {
      if (isUniqueKindSlugError(error)) {
        throw new ConflictError('A category with this kind and slug already exists');
      }
      throw error;
    }
  },

  async update(id: string, input: UpdateCategoryInput): Promise<CategoryDto> {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw new NotFoundError('Category not found');

    const data: Prisma.CategoryUncheckedUpdateInput = { ...input };
    try {
      const row = await categoryRepository.update(id, data);
      return toCategory(row);
    } catch (error) {
      if (isUniqueKindSlugError(error)) {
        throw new ConflictError('A category with this kind and slug already exists');
      }
      throw error;
    }
  },

  async remove(id: string): Promise<void> {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw new NotFoundError('Category not found');
    await categoryRepository.delete(id);
  },
};

function isUniqueKindSlugError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002'
  );
}
