'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { CheckCircle2, CreditCard, Loader2 } from 'lucide-react';
import type { BookingDetailDto, CheckoutDto, PaymentDto } from '@travel/types';
import { useAuth } from '@/components/auth/auth-provider';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

type State = 'loading' | 'ready' | 'processing' | 'success' | 'error';

export default function PayPage() {
  const t = useTranslations('payment');
  const locale = useLocale();
  const { status, authFetch } = useAuth();
  const params = useParams<{ id: string }>();
  const bookingId = params.id;

  const [booking, setBooking] = useState<BookingDetailDto | null>(null);
  const [checkout, setCheckout] = useState<CheckoutDto | null>(null);
  const [state, setState] = useState<State>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status !== 'authenticated') return;
    let active = true;
    (async () => {
      try {
        const b = await authFetch<BookingDetailDto>(`/bookings/${bookingId}`);
        if (!active) return;
        setBooking(b);
        const c = await authFetch<CheckoutDto>('/payments/initiate', {
          method: 'POST',
          body: JSON.stringify({ bookingId, provider: 'STRIPE' }),
        });
        if (!active) return;
        setCheckout(c);
        if (c.mode === 'live' && c.redirectUrl) {
          window.location.href = c.redirectUrl;
          return;
        }
        setState('ready');
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : t('error'));
        setState('error');
      }
    })();
    return () => {
      active = false;
    };
  }, [status, bookingId, authFetch, t]);

  async function pay() {
    if (!checkout) return;
    setState('processing');
    try {
      await authFetch<PaymentDto>(`/payments/${checkout.paymentId}/confirm-mock`, { method: 'POST' });
      setState('success');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('error'));
      setState('error');
    }
  }

  return (
    <div className="container-px mx-auto flex min-h-[70vh] max-w-md flex-col justify-center py-16">
      <Card className="p-8">
        <h1 className="text-center font-display text-2xl font-bold">{t('title')}</h1>

        {(state === 'loading' || status !== 'authenticated') && (
          <div className="mt-8 flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="size-8 animate-spin" />
            <p>{t('loading')}</p>
          </div>
        )}

        {state === 'ready' && booking && checkout && (
          <div className="mt-6 space-y-6">
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{t('reference')}</span>
                <span className="font-medium text-foreground">{booking.reference}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('amountDue')}</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(checkout.amount, checkout.currency, locale)}
                </span>
              </div>
            </div>
            <Button size="lg" className="w-full" onClick={pay}>
              <CreditCard className="size-4" /> {t('payMock')}
            </Button>
          </div>
        )}

        {state === 'processing' && (
          <div className="mt-8 flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="size-8 animate-spin" />
            <p>{t('processing')}</p>
          </div>
        )}

        {state === 'success' && (
          <div className="mt-6 text-center">
            <CheckCircle2 className="mx-auto size-14 text-primary" />
            <h2 className="mt-4 text-lg font-bold">{t('successTitle')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t('successBody')}</p>
            <Button asChild className="mt-6">
              <Link href="/dashboard">{t('viewBooking')}</Link>
            </Button>
          </div>
        )}

        {state === 'error' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-danger-600">{error || t('error')}</p>
            <Button variant="outline" className="mt-5" onClick={() => window.location.reload()}>
              {t('title')}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
