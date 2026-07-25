import type { PaymentProvider as PaymentProviderName } from '@travel/types';
import type {
  CheckoutParams,
  CheckoutSession,
  PaymentGateway,
  RefundResult,
  WebhookResult,
} from './payment.types';

/**
 * Deterministic local gateway used when a provider has no credentials. The
 * checkout "redirect" points back at our own mock-confirm endpoint so the whole
 * pay → confirm → refund flow works end-to-end in development.
 */
export class MockGateway implements PaymentGateway {
  readonly mode = 'mock' as const;

  constructor(readonly name: PaymentProviderName) {}

  async createCheckout(params: CheckoutParams): Promise<CheckoutSession> {
    const checkoutId = `mock_${this.name.toLowerCase()}_${params.paymentId}`;
    return {
      checkoutId,
      redirectUrl: `${params.returnUrl}?paymentId=${params.paymentId}&mock=1`,
      clientSecret: `${checkoutId}_secret`,
      raw: { mock: true, provider: this.name },
    };
  }

  async parseWebhook(rawBody: string): Promise<WebhookResult> {
    const payload = JSON.parse(rawBody) as { providerRef?: string; status?: string };
    return {
      providerRef: payload.providerRef ?? '',
      status: payload.status === 'FAILED' ? 'FAILED' : 'PAID',
      raw: payload,
    };
  }

  async refund(providerRef: string, _amount: number, _currency: string): Promise<RefundResult> {
    return { providerRef: `refund_${providerRef}`, status: 'COMPLETED', raw: { mock: true } };
  }
}
