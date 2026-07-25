import type { Request, Response } from 'express';
import type {
  CreateTestimonialInput,
  SetTestimonialStatusInput,
  TestimonialQuery,
  UpdateTestimonialInput,
} from '@travel/types';
import { testimonialService } from './testimonial.service';
import { sendCreated, sendNoContent, sendPaginated, sendSuccess } from '../../lib/http';

export const testimonialController = {
  async listPublic(req: Request, res: Response): Promise<void> {
    const result = await testimonialService.listPublic(req.query as unknown as TestimonialQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async listAdmin(req: Request, res: Response): Promise<void> {
    const result = await testimonialService.listAdmin(req.query as unknown as TestimonialQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async create(req: Request, res: Response): Promise<void> {
    const testimonial = await testimonialService.create(req.body as CreateTestimonialInput);
    sendCreated(res, testimonial, 'Testimonial created successfully');
  },

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const testimonial = await testimonialService.update(id, req.body as UpdateTestimonialInput);
    sendSuccess(res, testimonial, 'Testimonial updated successfully');
  },

  async setStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const { status } = req.body as SetTestimonialStatusInput;
    const testimonial = await testimonialService.setStatus(id, status);
    sendSuccess(res, testimonial, 'Testimonial status updated');
  },

  async remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    await testimonialService.remove(id);
    sendNoContent(res);
  },
};
