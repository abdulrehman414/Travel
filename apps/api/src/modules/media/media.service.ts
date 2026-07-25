import { buildPageMeta } from '@travel/types';
import type { MediaDto, MediaQuery, MediaType, Paginated } from '@travel/types';
import { getStorage } from '../../integrations/storage';
import { mediaRepository, type MediaRow } from './media.repository';
import { BadRequestError, NotFoundError } from '../../lib/api-error';

export interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface UploadFields {
  folder?: string;
  altEn?: string;
  altAr?: string;
}

const MAX_BYTES = 8 * 1024 * 1024;

function mediaTypeFromMime(mime: string): MediaType {
  if (mime.startsWith('image/')) return 'IMAGE';
  if (mime.startsWith('video/')) return 'VIDEO';
  return 'DOCUMENT';
}

function toDto(row: MediaRow): MediaDto {
  return {
    id: row.id,
    type: row.type,
    url: row.url,
    publicId: row.publicId,
    fileName: row.fileName,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    width: row.width,
    height: row.height,
    folder: row.folder,
    altEn: row.altEn,
    altAr: row.altAr,
    createdAt: row.createdAt.toISOString(),
  };
}

export const mediaService = {
  async upload(file: UploadedFile, uploadedById: string, fields: UploadFields): Promise<MediaDto> {
    if (!file || file.size === 0) throw new BadRequestError('No file provided');
    if (file.size > MAX_BYTES) throw new BadRequestError('File exceeds the 8MB limit');

    const result = await getStorage().upload(file.buffer, {
      fileName: file.originalname,
      mimeType: file.mimetype,
      folder: fields.folder,
    });

    const row = await mediaRepository.create({
      type: mediaTypeFromMime(file.mimetype),
      url: result.url,
      publicId: result.publicId,
      fileName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: result.sizeBytes,
      width: result.width,
      height: result.height,
      folder: fields.folder,
      altEn: fields.altEn,
      altAr: fields.altAr,
      uploadedById,
    });
    return toDto(row);
  },

  async list(query: MediaQuery): Promise<Paginated<MediaDto>> {
    const { rows, total } = await mediaRepository.list(query);
    return { items: rows.map(toDto), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async remove(id: string): Promise<void> {
    const row = await mediaRepository.findById(id);
    if (!row) throw new NotFoundError('Media not found');
    if (row.publicId) {
      await getStorage().remove(row.publicId);
    }
    await mediaRepository.delete(id);
  },
};
