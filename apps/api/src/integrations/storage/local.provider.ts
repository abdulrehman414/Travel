import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { env } from '../../config/env';
import type { StorageProvider, UploadOptions, UploadResult } from './storage.types';

const UPLOADS_ROOT = path.resolve(process.cwd(), 'uploads');

function safeName(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase().slice(0, 8);
  return `${randomBytes(8).toString('hex')}${ext}`;
}

/** Dev fallback: writes to ./uploads and serves via /uploads static route. */
export class LocalStorageProvider implements StorageProvider {
  readonly name = 'local';
  readonly mode = 'mock' as const;

  async upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult> {
    const folder = options.folder ? path.join('media', options.folder) : 'media';
    const dir = path.join(UPLOADS_ROOT, folder);
    await mkdir(dir, { recursive: true });

    const name = safeName(options.fileName);
    await writeFile(path.join(dir, name), buffer);

    const relative = path.join(folder, name).split(path.sep).join('/');
    return {
      url: `${env.API_PUBLIC_URL}/uploads/${relative}`,
      publicId: relative,
      sizeBytes: buffer.byteLength,
    };
  }

  async remove(publicId: string): Promise<void> {
    try {
      await unlink(path.join(UPLOADS_ROOT, publicId));
    } catch {
      /* already gone */
    }
  }
}
