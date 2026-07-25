import type { Request, Response } from 'express';
import type { CreateHotelInput, HotelQuery, UpdateHotelInput } from '@travel/types';
import { hotelService } from './hotel.service';
import { sendCreated, sendNoContent, sendPaginated, sendSuccess } from '../../lib/http';

export const hotelController = {
  async list(req: Request, res: Response): Promise<void> {
    const result = await hotelService.list(req.query as unknown as HotelQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async getBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = req.params as { slug: string };
    sendSuccess(res, await hotelService.getBySlug(slug));
  },

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    sendSuccess(res, await hotelService.getById(id));
  },

  async create(req: Request, res: Response): Promise<void> {
    const hotel = await hotelService.create(req.body as CreateHotelInput);
    sendCreated(res, hotel, 'Hotel created successfully');
  },

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const hotel = await hotelService.update(id, req.body as UpdateHotelInput);
    sendSuccess(res, hotel, 'Hotel updated successfully');
  },

  async remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    await hotelService.remove(id);
    sendNoContent(res);
  },
};
