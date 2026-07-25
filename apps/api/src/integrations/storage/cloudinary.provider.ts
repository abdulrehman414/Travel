import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { env } from '../../config/env';
import type { StorageProvider, UploadOptions, UploadResult } from './storage.types';

export class CloudinaryProvider implements StorageProvider {
  readonly name = 'cloudinary';
  readonly mode = 'live' as const;

  constructor() {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
  }

  upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult> {
    const folder = options.folder
      ? `${env.CLOUDINARY_UPLOAD_FOLDER}/${options.folder}`
      : env.CLOUDINARY_UPLOAD_FOLDER;

    return new Promise<UploadResult>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, result?: UploadApiResponse) => {
          if (error || !result) {
            reject(error ?? new Error('Cloudinary upload failed'));
            return;
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            sizeBytes: result.bytes,
          });
        },
      );
      stream.end(buffer);
    });
  }

  async remove(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
