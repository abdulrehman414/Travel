import { env } from '../../config/env';
import type {
  CheckoutParams,
  CheckoutSession,
  PaymentGateway,
  RefundResult,
  WebhookResult,
} from './payment.types';

/** PayTabs (PT2) adapter — hosted payment page via /payment/request. */
export class PayTabsGateway implements PaymentGateway {
  readonly name = 'PAYTABS' as const;
  readonly mode = 'live' as const;

  private headers(): Record<string, string> {
    return { authorization: env.PAYTABS_SERVER_KEY, 'Content-Type': 'application/json' };
  }

  async createCheckout(params: CheckoutParams): Promise<CheckoutSession> {
    const res = await fetch(`${env.PAYTABS_BASE_URL}/payment/request`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        profile_id: Number(env.PAYTABS_PROFILE_ID),
        tran_type: 'sale',
        tran_class: 'ecom',
        cart_id: params.paymentId,
        cart_currency: params.currency,
        cart_amount: params.amount,
        cart_description: `Booking ${params.bookingReference}`,
        customer_details: { email: params.customerEmail },
        return: `${params.returnUrl}?paymentId=${params.paymentId}`,
        callback: params.webhookUrl,
      }),
    });
    const data = (await res.json()) as { tran_ref?: string; redirect_url?: string };
    return {
      checkoutId: data.tran_ref ?? params.paymentId,
      redirectUrl: data.redirect_url,
      raw: data,
    };
  }

  async parseWebhook(rawBody: string): Promise<WebhookResult> {
    const payload = JSON.parse(rawBody) as {
      tran_ref?: string;
      cart_id?: string;
      payment_result?: { response_status?: string };
    };
    const status = payload.payment_result?.response_status;
    return {
      providerRef: payload.tran_ref ?? payload.cart_id ?? '',
      status: status === 'A' ? 'PAID' : status === 'H' || status === 'P' ? 'PENDING' : 'FAILED',
      raw: payload,
    };
  }

  async refund(providerRef: string, amount: number, currency: string): Promise<RefundResult> {
    const res = await fetch(`${env.PAYTABS_BASE_URL}/payment/request`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        profile_id: Number(env.PAYTABS_PROFILE_ID),
        tran_type: 'refund',
        tran_class: 'ecom',
        tran_ref: providerRef,
        cart_id: `refund_${providerRef}`,
        cart_currency: currency,
        cart_amount: amount,
        cart_description: 'Refund',
      }),
    });
    const data = (await res.json()) as {
      tran_ref?: string;
      payment_result?: { response_status?: string };
    };
    return {
      providerRef: data.tran_ref ?? providerRef,
      status: data.payment_result?.response_status === 'A' ? 'COMPLETED' : 'PENDING',
      raw: data,
    };
  }
}
