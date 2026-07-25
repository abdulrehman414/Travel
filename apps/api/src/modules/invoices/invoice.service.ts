import { randomBytes } from 'node:crypto';
import { buildPageMeta } from '@travel/types';
import type { InvoiceDto, InvoiceQuery, Paginated } from '@travel/types';
import { env } from '../../config/env';
import { invoiceRepository } from './invoice.repository';
import { toInvoiceDto } from './invoice.mapper';
import { renderInvoicePdf, type InvoicePdfData } from '../../integrations/pdf/invoice-pdf';
import { emailService } from '../../integrations/email';
import { BadRequestError, NotFoundError } from '../../lib/api-error';

const GENERATE_ATTEMPTS = 5;

function generateNumber(): string {
  return `INV-${new Date().getFullYear()}-${randomBytes(3).toString('hex').toUpperCase()}`;
}

function isUniqueError(error: unknown, field?: string): boolean {
  if (
    typeof error !== 'object' ||
    error === null ||
    !('code' in error) ||
    (error as { code?: string }).code !== 'P2002'
  ) {
    return false;
  }
  if (!field) return true;
  const target = (error as { meta?: { target?: string[] } }).meta?.target;
  return Array.isArray(target) && target.includes(field);
}

function assertAccess(ownerId: string, userId: string, isAdmin: boolean): void {
  if (!isAdmin && ownerId !== userId) throw new NotFoundError('Invoice not found');
}

export const invoiceService = {
  async generate(bookingId: string, userId: string, isAdmin: boolean): Promise<InvoiceDto> {
    const booking = await invoiceRepository.findBookingForInvoice(bookingId);
    if (!booking) throw new NotFoundError('Booking not found');
    assertAccess(booking.userId, userId, isAdmin);

    const existing = await invoiceRepository.findByBookingId(bookingId);
    if (existing) return toInvoiceDto(existing);

    const status = booking.status === 'PAID' ? 'PAID' : 'ISSUED';
    const items = booking.items.map((item) => ({
      description: item.titleSnapshot,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      total: Number(item.totalPrice),
    }));
    const billingName = `${booking.user.firstName} ${booking.user.lastName}`.trim();

    for (let attempt = 0; attempt < GENERATE_ATTEMPTS; attempt += 1) {
      try {
        const invoice = await invoiceRepository.create({
          number: generateNumber(),
          bookingId,
          userId: booking.userId,
          status,
          currency: booking.currency,
          subtotal: booking.subtotal,
          taxTotal: booking.taxTotal,
          discountTotal: booking.discountTotal,
          total: booking.grandTotal,
          paidAt: status === 'PAID' ? new Date() : null,
          billingName,
          billingEmail: booking.contactEmail,
          items: { create: items },
        });
        const withUrl = await invoiceRepository.update(invoice.id, {
          pdfUrl: `${env.API_PUBLIC_URL}/api/v1/invoices/${invoice.id}/pdf`,
        });
        return toInvoiceDto(withUrl);
      } catch (error) {
        if (isUniqueError(error, 'bookingId')) {
          const race = await invoiceRepository.findByBookingId(bookingId);
          if (race) return toInvoiceDto(race);
        }
        if (isUniqueError(error, 'number')) continue; // number collision — retry
        throw error;
      }
    }
    throw new BadRequestError('Could not generate a unique invoice number, please retry');
  },

  async getByBooking(bookingId: string, userId: string, isAdmin: boolean): Promise<InvoiceDto> {
    const invoice = await invoiceRepository.findByBookingId(bookingId);
    if (!invoice) throw new NotFoundError('Invoice not found');
    assertAccess(invoice.userId, userId, isAdmin);
    return toInvoiceDto(invoice);
  },

  async getById(id: string, userId: string, isAdmin: boolean): Promise<InvoiceDto> {
    const invoice = await invoiceRepository.findById(id);
    if (!invoice) throw new NotFoundError('Invoice not found');
    assertAccess(invoice.userId, userId, isAdmin);
    return toInvoiceDto(invoice);
  },

  async renderPdf(
    id: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const invoice = await invoiceRepository.findByIdWithOwner(id);
    if (!invoice) throw new NotFoundError('Invoice not found');
    assertAccess(invoice.booking.userId, userId, isAdmin);

    const buffer = await renderInvoicePdf(this.toPdfData(invoice));
    return { buffer, filename: `${invoice.number}.pdf` };
  },

  async send(id: string): Promise<{ sent: boolean }> {
    const invoice = await invoiceRepository.findByIdWithOwner(id);
    if (!invoice) throw new NotFoundError('Invoice not found');
    const buffer = await renderInvoicePdf(this.toPdfData(invoice));
    const sent = await emailService.send({
      to: invoice.billingEmail,
      subject: `Your invoice ${invoice.number}`,
      html: `<p>Dear ${invoice.billingName},</p><p>Please find your invoice <strong>${invoice.number}</strong> attached.</p>`,
      attachments: [{ filename: `${invoice.number}.pdf`, content: buffer, contentType: 'application/pdf' }],
    });
    return { sent };
  },

  async listAdmin(query: InvoiceQuery): Promise<Paginated<InvoiceDto>> {
    const { rows, total } = await invoiceRepository.list(query);
    return { items: rows.map(toInvoiceDto), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async voidInvoice(id: string): Promise<InvoiceDto> {
    const invoice = await invoiceRepository.findById(id);
    if (!invoice) throw new NotFoundError('Invoice not found');
    const updated = await invoiceRepository.update(id, { status: 'VOID' });
    return toInvoiceDto(updated);
  },

  toPdfData(invoice: NonNullable<Awaited<ReturnType<typeof invoiceRepository.findByIdWithOwner>>>): InvoicePdfData {
    return {
      number: invoice.number,
      issuedAt: invoice.issuedAt,
      status: invoice.status,
      currency: invoice.currency,
      bookingReference: invoice.booking.reference,
      billingName: invoice.billingName,
      billingEmail: invoice.billingEmail,
      billingAddress: invoice.billingAddress,
      vatNumber: invoice.vatNumber,
      items: invoice.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
      })),
      subtotal: Number(invoice.subtotal),
      taxTotal: Number(invoice.taxTotal),
      discountTotal: Number(invoice.discountTotal),
      total: Number(invoice.total),
    };
  },
};
