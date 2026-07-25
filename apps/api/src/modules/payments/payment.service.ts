import { buildPageMeta } from '@travel/types';
import type {
  CheckoutDto,
  InitiatePaymentInput,
  Paginated,
  PaymentDto,
  PaymentProvider as PaymentProviderName,
  PaymentQuery,
} from '@travel/types';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { getGateway } from '../../integrations/payments';
import { bookingRepository } from '../bookings/booking.repository';
import { paymentRepository } from './payment.repository';
import { toPaymentDto } from './payment.mapper';
import { round2 } from '../bookings/booking.mapper';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ServiceUnavailableError,
} from '../../lib/api-error';

function assertBookingAccess(userId: string, isAdmin: boolean, bookingUserId: string): void {
  if (!isAdmin && bookingUserId !== userId) throw new NotFoundError('Booking not found');
}

export const paymentService = {
  async initiate(
    input: InitiatePaymentInput,
    userId: string,
    isAdmin: boolean,
  ): Promise<CheckoutDto> {
    const booking = await bookingRepository.findById(input.bookingId);
    if (!booking) throw new NotFoundError('Booking not found');
    assertBookingAccess(userId, isAdmin, booking.userId);

    if (booking.status === 'PAID') throw new BadRequestError('This booking is already paid');
    if (booking.status === 'CANCELLED') throw new BadRequestError('This booking was cancelled');

    const amount = round2(Number(booking.grandTotal) - Number(booking.paidTotal));
    if (amount <= 0) throw new BadRequestError('Nothing left to pay on this booking');

    const gateway = getGateway(input.provider);
    const payment = await paymentRepository.create({
      bookingId: booking.id,
      provider: input.provider,
      method: input.method,
      status: 'PROCESSING',
      amount,
      currency: booking.currency,
    });

    const checkout = await gateway.createCheckout({
      paymentId: payment.id,
      bookingReference: booking.reference,
      amount,
      currency: booking.currency,
      customerEmail: booking.contactEmail,
      returnUrl: `${env.WEB_APP_URL}/bookings/${booking.reference}/payment`,
      webhookUrl: `${env.API_PUBLIC_URL}/api/v1/payments/webhook/${input.provider.toLowerCase()}`,
    });

    const updated = await paymentRepository.update(payment.id, {
      providerCheckoutId: checkout.checkoutId,
      rawPayload: (checkout.raw ?? {}) as object,
    });

    return {
      paymentId: updated.id,
      provider: input.provider,
      status: updated.status,
      amount,
      currency: booking.currency,
      checkoutId: checkout.checkoutId,
      redirectUrl: checkout.redirectUrl ?? null,
      clientSecret: checkout.clientSecret ?? null,
      mode: gateway.mode,
    };
  },

  async handleWebhook(
    providerName: PaymentProviderName,
    rawBody: string,
    signature: string | undefined,
  ): Promise<void> {
    const gateway = getGateway(providerName);
    const result = await gateway.parseWebhook(rawBody, signature);
    if (!result.providerRef) return;

    const payment = await paymentRepository.findByProviderRef(providerName, result.providerRef);
    if (!payment) {
      logger.warn({ providerName, ref: result.providerRef }, 'Webhook for unknown payment');
      return;
    }
    await this.applyResult(payment.id, payment.bookingId, payment.status, result.status, result.providerRef);
  },

  /** Shared settlement path for both webhook and the mock-confirm helper. */
  async applyResult(
    paymentId: string,
    bookingId: string,
    currentStatus: string,
    providerStatus: 'PAID' | 'FAILED' | 'PENDING',
    providerRef: string,
  ): Promise<void> {
    if (currentStatus === 'PAID') return; // idempotent

    if (providerStatus === 'PAID') {
      await paymentRepository.update(paymentId, {
        status: 'PAID',
        paidAt: new Date(),
        providerRef,
      });
      await paymentRepository.settleBooking(bookingId);
    } else if (providerStatus === 'FAILED') {
      await paymentRepository.update(paymentId, {
        status: 'FAILED',
        failureReason: 'Payment failed at the gateway',
      });
    }
  },

  /** Development/mock helper — simulates the gateway confirming a payment. */
  async confirmMock(paymentId: string, userId: string, isAdmin: boolean): Promise<PaymentDto> {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) throw new NotFoundError('Payment not found');
    const gateway = getGateway(payment.provider);
    if (gateway.mode !== 'mock') {
      throw new ForbiddenError('Mock confirmation is only available for mock-mode providers');
    }
    const booking = await bookingRepository.findById(payment.bookingId);
    if (!booking) throw new NotFoundError('Booking not found');
    assertBookingAccess(userId, isAdmin, booking.userId);

    await this.applyResult(
      payment.id,
      payment.bookingId,
      payment.status,
      'PAID',
      payment.providerCheckoutId ?? payment.id,
    );
    const refreshed = await paymentRepository.findById(paymentId);
    if (!refreshed) throw new NotFoundError('Payment not found');
    return toPaymentDto(refreshed);
  },

  async refund(paymentId: string, amount: number | undefined, reason?: string): Promise<PaymentDto> {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) throw new NotFoundError('Payment not found');
    if (payment.status !== 'PAID' && payment.status !== 'PARTIALLY_REFUNDED') {
      throw new BadRequestError('Only paid payments can be refunded');
    }

    const paidAmount = Number(payment.amount);
    const alreadyRefunded = payment.refunds
      .filter((r) => r.status === 'COMPLETED')
      .reduce((sum, r) => sum + Number(r.amount), 0);
    const refundable = round2(paidAmount - alreadyRefunded);
    const refundAmount = round2(amount ?? refundable);

    if (refundAmount <= 0 || refundAmount > refundable) {
      throw new BadRequestError(`Refund amount must be between 0 and ${refundable}`);
    }

    const gateway = getGateway(payment.provider);
    const providerRef = payment.providerRef ?? payment.providerCheckoutId;
    if (!providerRef) throw new ServiceUnavailableError('Payment has no provider reference');

    const result = await gateway.refund(providerRef, refundAmount, payment.currency);

    await paymentRepository.createRefund({
      paymentId: payment.id,
      amount: refundAmount,
      currency: payment.currency,
      status: result.status,
      reason: reason ?? null,
      providerRef: result.providerRef,
      processedAt: result.status === 'COMPLETED' ? new Date() : null,
    });

    if (result.status === 'COMPLETED') {
      const newRefunded = round2(alreadyRefunded + refundAmount);
      const fullyRefunded = newRefunded >= paidAmount;
      await paymentRepository.update(payment.id, {
        status: fullyRefunded ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      });
      await paymentRepository.settleBooking(payment.bookingId);
      if (fullyRefunded) {
        await bookingRepository.update(payment.bookingId, { status: 'REFUNDED' });
      }
    }

    const refreshed = await paymentRepository.findById(paymentId);
    if (!refreshed) throw new NotFoundError('Payment not found');
    return toPaymentDto(refreshed);
  },

  async listAdmin(query: PaymentQuery): Promise<Paginated<PaymentDto>> {
    const { rows, total } = await paymentRepository.list(query);
    return { items: rows.map(toPaymentDto), meta: buildPageMeta(total, query.page, query.limit) };
  },

  async listByBooking(bookingId: string, userId: string, isAdmin: boolean): Promise<PaymentDto[]> {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new NotFoundError('Booking not found');
    assertBookingAccess(userId, isAdmin, booking.userId);
    const rows = await paymentRepository.listByBooking(bookingId);
    return rows.map(toPaymentDto);
  },
};
