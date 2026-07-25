import { buildPageMeta } from '@travel/types';
import type {
  CreateTagInput,
  Paginated,
  TagDto,
  TagQuery,
  UpdateTagInput,
} from '@travel/types';
import { tagRepository, type TagRow } from './tag.repository';
import { ConflictError, NotFoundError } from '../../lib/api-error';

function toTagDto(row: TagRow): TagDto {
  return {
    id: row.id,
    slug: row.slug,
    nameEn: row.nameEn,
    nameAr: row.nameAr,
    createdAt: row.createdAt.toISOString(),
  };
}

export const tagService = {
  async listPublic(query: TagQuery): Promise<Paginated<TagDto>> {
    const { rows, total } = await tagRepository.list(query);
    return { items: rows.map(toTagDto), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async listAdmin(query: TagQuery): Promise<Paginated<TagDto>> {
    const { rows, total } = await tagRepository.list(query);
    return { items: rows.map(toTagDto), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async getBySlug(slug: string): Promise<TagDto> {
    const row = await tagRepository.findBySlug(slug);
    if (!row) throw new NotFoundError('Tag not found');
    return toTagDto(row);
  },

  async create(input: CreateTagInput): Promise<TagDto> {
    try {
      const row = await tagRepository.create({
        slug: input.slug,
        nameEn: input.nameEn,
        nameAr: input.nameAr,
      });
      return toTagDto(row);
    } catch (error) {
      if (isUniqueSlugError(error)) throw new ConflictError('A tag with this slug already exists');
      throw error;
    }
  },

  async update(id: string, input: UpdateTagInput): Promise<TagDto> {
    const existing = await tagRepository.findById(id);
    if (!existing) throw new NotFoundError('Tag not found');

    try {
      const row = await tagRepository.update(id, input);
      return toTagDto(row);
    } catch (error) {
      if (isUniqueSlugError(error)) throw new ConflictError('A tag with this slug already exists');
      throw error;
    }
  },

  async remove(id: string): Promise<void> {
    const existing = await tagRepository.findById(id);
    if (!existing) throw new NotFoundError('Tag not found');
    await tagRepository.delete(id);
  },
};

function isUniqueSlugError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002'
  );
}
