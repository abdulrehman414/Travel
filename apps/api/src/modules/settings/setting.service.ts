import { buildPageMeta } from '@travel/types';
import type {
  Paginated,
  PublicSettings,
  SettingDto,
  SettingQuery,
  UpsertSettingInput,
} from '@travel/types';
import { type Prisma, type Setting } from '@travel/db';
import { settingRepository } from './setting.repository';
import { BadRequestError, NotFoundError } from '../../lib/api-error';

/** Groups exposed by the unauthenticated /settings/public endpoint. */
const PUBLIC_GROUPS = ['general', 'contact', 'features'];

function toDto(row: Setting): SettingDto {
  return {
    id: row.id,
    key: row.key,
    group: row.group,
    value: row.value,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const settingService = {
  async list(query: SettingQuery): Promise<Paginated<SettingDto>> {
    const { rows, total } = await settingRepository.list(query);
    return { items: rows.map(toDto), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async getByKey(key: string): Promise<SettingDto> {
    const row = await settingRepository.findByKey(key);
    if (!row) throw new NotFoundError('Setting not found');
    return toDto(row);
  },

  async getPublic(): Promise<PublicSettings> {
    const rows = await settingRepository.findByGroups(PUBLIC_GROUPS);
    const result: PublicSettings = {};
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  },

  async upsert(key: string, input: UpsertSettingInput): Promise<SettingDto> {
    if (input.value === undefined) {
      throw new BadRequestError('A "value" is required');
    }
    const row = await settingRepository.upsert(
      key,
      input.value as Prisma.InputJsonValue,
      input.group,
    );
    return toDto(row);
  },

  async remove(key: string): Promise<void> {
    if (!(await settingRepository.exists(key))) {
      throw new NotFoundError('Setting not found');
    }
    await settingRepository.delete(key);
  },
};
