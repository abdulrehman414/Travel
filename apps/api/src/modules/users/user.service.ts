import { buildPageMeta } from '@travel/types';
import type {
  Paginated,
  SetUserRolesInput,
  UpdateUserInput,
  UserDto,
  UserQuery,
} from '@travel/types';
import type { Prisma } from '@travel/db';
import { userRepository } from './user.repository';
import { toUser } from './user.mapper';
import { BadRequestError, ConflictError, NotFoundError } from '../../lib/api-error';

export const userService = {
  async list(query: UserQuery): Promise<Paginated<UserDto>> {
    const { rows, total } = await userRepository.list(query);
    return { items: rows.map(toUser), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async getById(id: string): Promise<UserDto> {
    const row = await userRepository.findById(id);
    if (!row) throw new NotFoundError('User not found');
    return toUser(row);
  },

  async update(id: string, input: UpdateUserInput): Promise<UserDto> {
    const existing = await userRepository.findById(id);
    if (!existing) throw new NotFoundError('User not found');

    const data: Prisma.UserUncheckedUpdateInput = { ...input };
    try {
      const row = await userRepository.update(id, data);
      return toUser(row);
    } catch (error) {
      if (isUniqueError(error)) throw new ConflictError('A user with this phone already exists');
      throw error;
    }
  },

  async setRoles(id: string, input: SetUserRolesInput): Promise<UserDto> {
    const existing = await userRepository.findById(id);
    if (!existing) throw new NotFoundError('User not found');

    const slugs = Array.from(new Set(input.roles));
    const found = await userRepository.findRolesBySlugs(slugs);
    if (found.length !== slugs.length) {
      const foundSlugs = new Set(found.map((role) => role.slug));
      const missing = slugs.filter((slug) => !foundSlugs.has(slug));
      throw new BadRequestError(`Unknown role slug(s): ${missing.join(', ')}`);
    }

    const row = await userRepository.replaceRoles(
      id,
      found.map((role) => role.id),
    );
    if (!row) throw new NotFoundError('User not found');
    return toUser(row);
  },

  async remove(id: string): Promise<void> {
    const existing = await userRepository.findById(id);
    if (!existing) throw new NotFoundError('User not found');
    await userRepository.softDelete(id);
  },
};

function isUniqueError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002'
  );
}
