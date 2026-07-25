import Stripe from 'stripe';
import { env } from '../../config/env';
import { ServiceUnavailableError } from '../../lib/api-error';
import type {
  CheckoutParams,
  CheckoutSession,
  PaymentGateway,
  RefundResult,
  WebhookResult,
} from './payment.types';

/** Stripe adapter (live). Uses Checkout Sessions + webhook signature verification. */
export class StripeGateway implements PaymentGateway {
  readonly name = 'STRIPE' as const;
  readonly mode = 'live' as const;
  private readonly stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' });
  }

  async createCheckout(params: CheckoutParams): Promise<CheckoutSession> {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: params.customerEmail,
      client_reference_id: params.paymentId,
      success_url: `${params.returnUrl}?paymentId=${params.paymentId}`,
      cancel_url: `${params.returnUrl}?paymentId=${params.paymentId}&cancelled=1`,
      metadata: { paymentId: params.paymentId, bookingReference: params.bookingReference },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: params.currency.toLowerCase(),
            unit_amount: Math.round(params.amount * 100),
            product_data: { name: `Booking ${params.bookingReference}` },
          },
        },
      ],
    });
    return {
      checkoutId: session.id,
      redirectUrl: session.url ?? undefined,
      clientSecret: session.client_secret ?? undefined,
      raw: session,
    };
  }

  async parseWebhook(rawBody: string, signature: string | undefined): Promise<WebhookResult> {
    if (!signature || !env.STRIPE_WEBHOOK_SECRET) {
      throw new ServiceUnavailableError('Stripe webhook is not configured');
    }
    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      return {
        providerRef: session.id,
        status: session.payment_status === 'paid' ? 'PAID' : 'PENDING',
        raw: event,
      };
    }
    if (event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object as Stripe.Checkout.Session;
      return { providerRef: session.id, status: 'FAILED', raw: event };
    }
    return { providerRef: '', status: 'PENDING', raw: event };
  }

  async refund(providerRef: string, amount: number, _currency: string): Promise<RefundResult> {
    // providerRef is the Checkout Session id; resolve its PaymentIntent.
    const session = await this.stripe.checkout.sessions.retrieve(providerRef);
    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;
    if (!paymentIntentId) {
      return { providerRef, status: 'FAILED', raw: { reason: 'no payment intent' } };
    }
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: Math.round(amount * 100),
    });
    return {
      providerRef: refund.id,
      status: refund.status === 'succeeded' ? 'COMPLETED' : 'PENDING',
      raw: refund,
    };
  }
}
