import type { Request, Response } from 'express';
import type { CreateFlightInput, FlightQuery, UpdateFlightInput } from '@travel/types';
import { flightService } from './flight.service';
import { sendCreated, sendNoContent, sendPaginated, sendSuccess } from '../../lib/http';

export const flightController = {
  async list(req: Request, res: Response): Promise<void> {
    const result = await flightService.list(req.query as unknown as FlightQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async getById(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await flightService.getById((req.params as { id: string }).id));
  },

  async create(req: Request, res: Response): Promise<void> {
    sendCreated(res, await flightService.create(req.body as CreateFlightInput), 'Flight created');
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = (req.params as { id: string }).id;
    sendSuccess(res, await flightService.update(id, req.body as UpdateFlightInput), 'Flight updated');
  },

  async remove(req: Request, res: Response): Promise<void> {
    await flightService.remove((req.params as { id: string }).id);
    sendNoContent(res);
  },
};
