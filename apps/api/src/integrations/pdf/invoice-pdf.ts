import PDFDocument from 'pdfkit';
import { APP } from '@travel/config/constants';

const PRIMARY = '#006C35';
const GOLD = '#D4AF37';
const INK = '#111827';
const MUTED = '#64748B';

export interface InvoicePdfItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoicePdfData {
  number: string;
  issuedAt: Date;
  status: string;
  currency: string;
  bookingReference?: string;
  billingName: string;
  billingEmail: string;
  billingAddress?: string | null;
  vatNumber?: string | null;
  items: InvoicePdfItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
}

const money = (value: number, currency: string): string =>
  `${currency} ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Renders a branded A4 invoice PDF and resolves the raw bytes. */
export function renderInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const left = 50;
    const right = 545;

    // Header band.
    doc.rect(0, 0, doc.page.width, 90).fill(PRIMARY);
    doc.rect(0, 90, doc.page.width, 4).fill(GOLD);
    doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text(APP.name, left, 32);
    doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text('INVOICE', 0, 30, {
      align: 'right',
      width: right,
    });

    // Meta.
    let y = 120;
    doc.fillColor(INK).fontSize(10).font('Helvetica');
    doc.text(`Invoice #: ${data.number}`, left, y);
    doc.text(`Date: ${data.issuedAt.toISOString().slice(0, 10)}`, left, y + 15);
    doc.text(`Status: ${data.status}`, left, y + 30);
    if (data.bookingReference) doc.text(`Booking: ${data.bookingReference}`, left, y + 45);

    // Bill to.
    doc.fillColor(MUTED).fontSize(9).font('Helvetica-Bold').text('BILL TO', 320, y);
    doc.fillColor(INK).fontSize(10).font('Helvetica').text(data.billingName, 320, y + 14);
    doc.text(data.billingEmail, 320, y + 28);
    if (data.billingAddress) doc.text(data.billingAddress, 320, y + 42, { width: 225 });
    if (data.vatNumber) doc.text(`VAT: ${data.vatNumber}`, 320, y + 56);

    // Items table header.
    y = 210;
    doc.rect(left, y, right - left, 24).fill('#F1F5F9');
    doc.fillColor(MUTED).fontSize(9).font('Helvetica-Bold');
    doc.text('DESCRIPTION', left + 10, y + 8);
    doc.text('QTY', 330, y + 8, { width: 40, align: 'right' });
    doc.text('UNIT', 385, y + 8, { width: 70, align: 'right' });
    doc.text('TOTAL', 465, y + 8, { width: 70, align: 'right' });

    // Rows.
    y += 24;
    doc.font('Helvetica').fontSize(10).fillColor(INK);
    for (const item of data.items) {
      doc.text(item.description, left + 10, y + 8, { width: 300 });
      doc.text(String(item.quantity), 330, y + 8, { width: 40, align: 'right' });
      doc.text(money(item.unitPrice, data.currency), 385, y + 8, { width: 70, align: 'right' });
      doc.text(money(item.total, data.currency), 465, y + 8, { width: 70, align: 'right' });
      y += 26;
      doc.moveTo(left, y).lineTo(right, y).strokeColor('#E2E8F0').stroke();
    }

    // Totals.
    y += 12;
    const totalRow = (label: string, value: string, bold = false): void => {
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fillColor(bold ? PRIMARY : INK).fontSize(bold ? 12 : 10);
      doc.text(label, 340, y, { width: 100, align: 'right' });
      doc.text(value, 445, y, { width: 90, align: 'right' });
      y += bold ? 22 : 18;
    };
    totalRow('Subtotal', money(data.subtotal, data.currency));
    if (data.discountTotal > 0) totalRow('Discount', `- ${money(data.discountTotal, data.currency)}`);
    totalRow('VAT', money(data.taxTotal, data.currency));
    doc.moveTo(340, y).lineTo(right, y).strokeColor('#CBD5E1').stroke();
    y += 8;
    totalRow('TOTAL', money(data.total, data.currency), true);

    // Footer.
    doc.fillColor(MUTED).fontSize(8).font('Helvetica');
    doc.text(
      `${APP.legalName} · ${APP.address.line1}, ${APP.address.city}, ${APP.address.country} · ${APP.supportEmail}`,
      left,
      780,
      { width: right - left, align: 'center' },
    );

    doc.end();
  });
}
