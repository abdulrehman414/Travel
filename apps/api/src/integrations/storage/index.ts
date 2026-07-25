import { env } from '../../config/env';
import type { StorageProvider } from './storage.types';
import { CloudinaryProvider } from './cloudinary.provider';
import { LocalStorageProvider } from './local.provider';

let provider: StorageProvider | undefined;

export function getStorage(): StorageProvider {
  if (provider) return provider;
  const hasCloudinary =
    env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET;
  provider = hasCloudinary ? new CloudinaryProvider() : new LocalStorageProvider();
  return provider;
}

export type { StorageProvider, UploadResult } from './storage.types';
