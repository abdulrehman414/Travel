import type { Response } from 'express';
import type { PageMeta } from '@travel/types';

export function sendSuccess<T>(res: Response, data: T, message?: string, status = 200): void {
  res.status(status).json({ success: true, data, ...(message ? { message } : {}) });
}

export function sendCreated<T>(res: Response, data: T, message?: string): void {
  sendSuccess(res, data, message, 201);
}

export function sendPaginated<T>(res: Response, items: T[], meta: PageMeta): void {
  res.status(200).json({ success: true, data: { items, meta } });
}

export function sendNoContent(res: Response): void {
  res.status(204).send();
}
