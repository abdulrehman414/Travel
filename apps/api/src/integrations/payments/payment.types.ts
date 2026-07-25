import type { PaymentProvider as PaymentProviderName } from '@travel/types';

export interface CheckoutParams {
  paymentId: string;
  bookingReference: string;
  amount: number;
  currency: string;
  customerEmail: string;
  returnUrl: string;
  webhookUrl: string;
}

export interface CheckoutSession {
  checkoutId: string;
  redirectUrl?: string;
  clientSecret?: string;
  raw?: unknown;
}

export type ProviderPaymentStatus = 'PAID' | 'FAILED' | 'PENDING';

export interface WebhookResult {
  /** Provider reference used to locate our Payment (checkout id or intent id). */
  providerRef: string;
  status: ProviderPaymentStatus;
  raw?: unknown;
}

export interface RefundResult {
  providerRef: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  raw?: unknown;
}

export interface PaymentGateway {
  readonly name: PaymentProviderName;
  readonly mode: 'live' | 'mock';
  createCheckout(params: CheckoutParams): Promise<CheckoutSession>;
  parseWebhook(rawBody: string, signature: string | undefined): Promise<WebhookResult>;
  refund(providerRef: string, amount: number, currency: string): Promise<RefundResult>;
}
