import { env } from '../../config/env';
import type {
  CheckoutParams,
  CheckoutSession,
  PaymentGateway,
  RefundResult,
  WebhookResult,
} from './payment.types';

const SUCCESS_CODE = /^(000\.000\.|000\.100\.1|000\.[36]|000\.400\.0[^3]|000\.400\.100)/;

/**
 * HyperPay (OPPWA) adapter. Creates a COPYandPAY checkout and reads results via
 * the result code. The frontend renders HyperPay's widget with the checkout id.
 */
export class HyperPayGateway implements PaymentGateway {
  readonly name = 'HYPERPAY' as const;
  readonly mode = 'live' as const;

  private authHeader(): Record<string, string> {
    return { Authorization: `Bearer ${env.HYPERPAY_ACCESS_TOKEN}` };
  }

  async createCheckout(params: CheckoutParams): Promise<CheckoutSession> {
    const body = new URLSearchParams({
      entityId: env.HYPERPAY_ENTITY_ID,
      amount: params.amount.toFixed(2),
      currency: params.currency,
      paymentType: 'DB',
      merchantTransactionId: params.paymentId,
      'customer.email': params.customerEmail,
    });
    const res = await fetch(`${env.HYPERPAY_BASE_URL}/v1/checkouts`, {
      method: 'POST',
      headers: { ...this.authHeader(), 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = (await res.json()) as { id: string };
    return {
      checkoutId: data.id,
      redirectUrl: `${env.WEB_APP_URL}/payment/hyperpay?checkoutId=${data.id}`,
      raw: data,
    };
  }

  async parseWebhook(rawBody: string): Promise<WebhookResult> {
    const payload = JSON.parse(rawBody) as {
      id?: string;
      merchantTransactionId?: string;
      result?: { code?: string };
    };
    const code = payload.result?.code ?? '';
    return {
      providerRef: payload.id ?? payload.merchantTransactionId ?? '',
      status: SUCCESS_CODE.test(code) ? 'PAID' : 'FAILED',
      raw: payload,
    };
  }

  async refund(providerRef: string, amount: number, currency: string): Promise<RefundResult> {
    const body = new URLSearchParams({
      entityId: env.HYPERPAY_ENTITY_ID,
      amount: amount.toFixed(2),
      currency,
      paymentType: 'RF',
    });
    const res = await fetch(`${env.HYPERPAY_BASE_URL}/v1/payments/${providerRef}`, {
      method: 'POST',
      headers: { ...this.authHeader(), 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = (await res.json()) as { id?: string; result?: { code?: string } };
    return {
      providerRef: data.id ?? providerRef,
      status: SUCCESS_CODE.test(data.result?.code ?? '') ? 'COMPLETED' : 'FAILED',
      raw: data,
    };
  }
}
