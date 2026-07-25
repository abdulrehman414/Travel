import type { Request, Response } from 'express';
import type { GenerateInvoiceInput, InvoiceQuery } from '@travel/types';
import { invoiceService } from './invoice.service';
import { sendCreated, sendPaginated, sendSuccess } from '../../lib/http';
import { UnauthorizedError } from '../../lib/api-error';

const ADMIN_ROLES = ['super-admin', 'admin', 'support'];

function principal(req: Request): { id: string; isAdmin: boolean } {
  if (!req.user) throw new UnauthorizedError();
  return { id: req.user.id, isAdmin: req.user.roles.some((role) => ADMIN_ROLES.includes(role)) };
}

export const invoiceController = {
  async generate(req: Request, res: Response): Promise<void> {
    const { id, isAdmin } = principal(req);
    const { bookingId } = req.body as GenerateInvoiceInput;
    sendCreated(res, await invoiceService.generate(bookingId, id, isAdmin), 'Invoice generated');
  },

  async getByBooking(req: Request, res: Response): Promise<void> {
    const { id, isAdmin } = principal(req);
    const bookingId = (req.params as { bookingId: string }).bookingId;
    sendSuccess(res, await invoiceService.getByBooking(bookingId, id, isAdmin));
  },

  async getById(req: Request, res: Response): Promise<void> {
    const { id, isAdmin } = principal(req);
    const invoiceId = (req.params as { id: string }).id;
    sendSuccess(res, await invoiceService.getById(invoiceId, id, isAdmin));
  },

  async downloadPdf(req: Request, res: Response): Promise<void> {
    const { id, isAdmin } = principal(req);
    const invoiceId = (req.params as { id: string }).id;
    const { buffer, filename } = await invoiceService.renderPdf(invoiceId, id, isAdmin);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.send(buffer);
  },

  async send(req: Request, res: Response): Promise<void> {
    const invoiceId = (req.params as { id: string }).id;
    sendSuccess(res, await invoiceService.send(invoiceId), 'Invoice emailed');
  },

  async listAdmin(req: Request, res: Response): Promise<void> {
    const result = await invoiceService.listAdmin(req.query as unknown as InvoiceQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async voidInvoice(req: Request, res: Response): Promise<void> {
    const invoiceId = (req.params as { id: string }).id;
    sendSuccess(res, await invoiceService.voidInvoice(invoiceId), 'Invoice voided');
  },
};
