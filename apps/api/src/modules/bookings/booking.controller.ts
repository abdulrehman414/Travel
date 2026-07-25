import type { Request, Response } from 'express';
import type {
  AdminBookingQuery,
  BookingQuery,
  CancelBookingInput,
  CreateBookingInput,
  SetBookingStatusInput,
  UpdateBookingInput,
} from '@travel/types';
import { bookingService } from './booking.service';
import { sendCreated, sendPaginated, sendSuccess } from '../../lib/http';
import { UnauthorizedError } from '../../lib/api-error';

const ADMIN_ROLES = ['super-admin', 'admin', 'support'];

function principal(req: Request): { id: string; isAdmin: boolean } {
  if (!req.user) throw new UnauthorizedError();
  return { id: req.user.id, isAdmin: req.user.roles.some((role) => ADMIN_ROLES.includes(role)) };
}

export const bookingController = {
  async create(req: Request, res: Response): Promise<void> {
    const { id } = principal(req);
    const booking = await bookingService.create(req.body as CreateBookingInput, id);
    sendCreated(res, booking, 'Booking created successfully');
  },

  async listOwn(req: Request, res: Response): Promise<void> {
    const { id } = principal(req);
    const result = await bookingService.listOwn(id, req.query as unknown as BookingQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async listAdmin(req: Request, res: Response): Promise<void> {
    const result = await bookingService.listAdmin(req.query as unknown as AdminBookingQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async getOne(req: Request, res: Response): Promise<void> {
    const { id, isAdmin } = principal(req);
    const bookingId = (req.params as { id: string }).id;
    sendSuccess(res, await bookingService.getOne(bookingId, id, isAdmin));
  },

  async update(req: Request, res: Response): Promise<void> {
    const { id, isAdmin } = principal(req);
    const bookingId = (req.params as { id: string }).id;
    const booking = await bookingService.update(bookingId, id, isAdmin, req.body as UpdateBookingInput);
    sendSuccess(res, booking, 'Booking updated');
  },

  async cancel(req: Request, res: Response): Promise<void> {
    const { id, isAdmin } = principal(req);
    const bookingId = (req.params as { id: string }).id;
    const { reason } = req.body as CancelBookingInput;
    sendSuccess(res, await bookingService.cancel(bookingId, id, isAdmin, reason), 'Booking cancelled');
  },

  async setStatus(req: Request, res: Response): Promise<void> {
    const bookingId = (req.params as { id: string }).id;
    const { status } = req.body as SetBookingStatusInput;
    sendSuccess(res, await bookingService.setStatus(bookingId, status), 'Booking status updated');
  },
};
