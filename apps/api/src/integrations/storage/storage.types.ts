export interface UploadOptions {
  fileName: string;
  mimeType: string;
  folder?: string;
}

export interface UploadResult {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  sizeBytes: number;
}

export interface StorageProvider {
  readonly name: string;
  readonly mode: 'live' | 'mock';
  upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult>;
  remove(publicId: string): Promise<void>;
}
