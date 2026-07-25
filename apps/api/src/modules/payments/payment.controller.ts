import type { Request, Response } from 'express';
import type {
  InitiatePaymentInput,
  PaymentProvider as PaymentProviderName,
  PaymentQuery,
  RefundPaymentInput,
} from '@travel/types';
import { paymentService } from './payment.service';
import { sendCreated, sendPaginated, sendSuccess } from '../../lib/http';
import { BadRequestError, UnauthorizedError } from '../../lib/api-error';

const ADMIN_ROLES = ['super-admin', 'admin', 'support'];

const PROVIDER_MAP: Record<string, PaymentProviderName> = {
  stripe: 'STRIPE',
  hyperpay: 'HYPERPAY',
  paytabs: 'PAYTABS',
  manual: 'MANUAL',
};

function principal(req: Request): { id: string; isAdmin: boolean } {
  if (!req.user) throw new UnauthorizedError();
  return { id: req.user.id, isAdmin: req.user.roles.some((role) => ADMIN_ROLES.includes(role)) };
}

export const paymentController = {
  async initiate(req: Request, res: Response): Promise<void> {
    const { id, isAdmin } = principal(req);
    const checkout = await paymentService.initiate(req.body as InitiatePaymentInput, id, isAdmin);
    sendCreated(res, checkout, 'Payment initiated');
  },

  async webhook(req: Request, res: Response): Promise<void> {
    const providerKey = (req.params as { provider: string }).provider.toLowerCase();
    const provider = PROVIDER_MAP[providerKey];
    if (!provider) throw new BadRequestError('Unknown payment provider');

    const rawBody = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body ?? {});
    const signature =
      (req.headers['stripe-signature'] as string | undefined) ??
      (req.headers['signature'] as string | undefined);

    await paymentService.handleWebhook(provider, rawBody, signature);
    res.status(200).json({ received: true });
  },

  async confirmMock(req: Request, res: Response): Promise<void> {
    const { id, isAdmin } = principal(req);
    const paymentId = (req.params as { id: string }).id;
    sendSuccess(res, await paymentService.confirmMock(paymentId, id, isAdmin), 'Payment confirmed');
  },

  async refund(req: Request, res: Response): Promise<void> {
    const paymentId = (req.params as { id: string }).id;
    const { amount, reason } = req.body as RefundPaymentInput;
    sendSuccess(res, await paymentService.refund(paymentId, amount, reason), 'Refund processed');
  },

  async listAdmin(req: Request, res: Response): Promise<void> {
    const result = await paymentService.listAdmin(req.query as unknown as PaymentQuery);
    sendPaginated(res, result.items, result.meta);
  },

  async listByBooking(req: Request, res: Response): Promise<void> {
    const { id, isAdmin } = principal(req);
    const bookingId = (req.params as { bookingId: string }).bookingId;
    sendSuccess(res, await paymentService.listByBooking(bookingId, id, isAdmin));
  },
};
