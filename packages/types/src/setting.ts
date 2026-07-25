import { z } from 'zod';
import { paginationQuerySchema } from './common';

export const settingQuerySchema = paginationQuerySchema.extend({
  group: z.string().max(60).optional(),
});
export type SettingQuery = z.infer<typeof settingQuerySchema>;

export const upsertSettingSchema = z.object({
  value: z.unknown(),
  group: z.string().min(1).max(60).optional(),
});
export type UpsertSettingInput = z.infer<typeof upsertSettingSchema>;

export const settingKeyParamSchema = z.object({
  key: z.string().min(1).max(120),
});
export type SettingKeyParam = z.infer<typeof settingKeyParamSchema>;

export interface SettingDto {
  id: string;
  key: string;
  group: string;
  value: unknown;
  updatedAt: string;
}

export type PublicSettings = Record<string, unknown>;
