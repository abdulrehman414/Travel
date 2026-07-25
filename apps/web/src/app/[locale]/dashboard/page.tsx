'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import type { BookingListItemDto, Paginated } from '@travel/types';
import { useAuth } from '@/components/auth/auth-provider';
import { Link, useRouter } from '@/i18n/navigation';
import { Card } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

const STATUS_VARIANT: Record<string, BadgeProps['variant']> = {
  PAID: 'success',
  CONFIRMED: 'success',
  COMPLETED: 'default',
  PENDING: 'gold',
  PARTIALLY_PAID: 'gold',
  CANCELLED: 'muted',
  REFUNDED: 'muted',
};

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const { status, user, authFetch } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingListItemDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }
    if (status !== 'authenticated') return;
    authFetch<Paginated<BookingListItemDto>>('/bookings?limit=20')
      .then((data) => setBookings(data.items))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [status, authFetch, router]);

  const dateFmt = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    dateStyle: 'medium',
  });

  return (
    <div className="container-px mx-auto max-w-[1000px] py-12">
      <h1 className="font-display text-3xl font-bold">{t('welcome', { name: user?.firstName ?? '' })}</h1>
      <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>

      <h2 className="mt-10 text-xl font-bold">{t('myBookings')}</h2>
      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" /> …
        </div>
      ) : bookings.length === 0 ? (
        <Card className="mt-4 p-10 text-center">
          <p className="text-muted-foreground">{t('noBookings')}</p>
          <Button asChild className="mt-5">
            <Link href="/packages">{t('browse')}</Link>
          </Button>
        </Card>
      ) : (
        <div className="mt-4 space-y-3">
          {bookings.map((b) => (
            <Card key={b.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-semibold">{b.reference}</p>
                <p className="text-xs text-muted-foreground">
                  {dateFmt.format(new Date(b.createdAt))} · {b.adults + b.children + b.infants}{' '}
                  {t('travellers')}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-primary">
                  {formatCurrency(b.grandTotal, b.currency, locale)}
                </span>
                <Badge variant={STATUS_VARIANT[b.status] ?? 'default'}>{b.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
