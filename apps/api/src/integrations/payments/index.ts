import type { PaymentProvider as PaymentProviderName } from '@travel/types';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import type { PaymentGateway } from './payment.types';
import { MockGateway } from './mock.gateway';
import { StripeGateway } from './stripe.gateway';
import { HyperPayGateway } from './hyperpay.gateway';
import { PayTabsGateway } from './paytabs.gateway';

function build(name: PaymentProviderName): PaymentGateway {
  try {
    switch (name) {
      case 'STRIPE':
        return env.STRIPE_SECRET_KEY ? new StripeGateway() : new MockGateway('STRIPE');
      case 'HYPERPAY':
        return env.HYPERPAY_ENTITY_ID && env.HYPERPAY_ACCESS_TOKEN
          ? new HyperPayGateway()
          : new MockGateway('HYPERPAY');
      case 'PAYTABS':
        return env.PAYTABS_PROFILE_ID && env.PAYTABS_SERVER_KEY
          ? new PayTabsGateway()
          : new MockGateway('PAYTABS');
      case 'MANUAL':
      default:
        return new MockGateway('MANUAL');
    }
  } catch (error) {
    logger.error({ error, provider: name }, 'Failed to init payment gateway; using mock');
    return new MockGateway(name);
  }
}

const cache = new Map<PaymentProviderName, PaymentGateway>();

export function getGateway(name: PaymentProviderName): PaymentGateway {
  const existing = cache.get(name);
  if (existing) return existing;
  const gateway = build(name);
  cache.set(name, gateway);
  return gateway;
}

export type { PaymentGateway } from './payment.types';
