'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Minus, Plus } from 'lucide-react';
import type { BookingDetailDto, DepartureDto } from '@travel/types';
import { useAuth } from '@/components/auth/auth-provider';
import { Link, useRouter } from '@/i18n/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

function Stepper({
  label,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="grid size-8 place-items-center rounded-full border border-border hover:bg-secondary"
          aria-label="decrease"
        >
          <Minus className="size-3.5" />
        </button>
        <span className="w-5 text-center font-medium">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="grid size-8 place-items-center rounded-full border border-border hover:bg-secondary"
          aria-label="increase"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export function BookingForm({
  packageId,
  price,
  currency,
  departures,
}: {
  packageId: string;
  price: number;
  currency: string;
  departures: DepartureDto[];
}) {
  const t = useTranslations('booking');
  const ta = useTranslations('auth');
  const locale = useLocale();
  const { status, authFetch } = useAuth();
  const router = useRouter();

  const [departureId, setDepartureId] = useState(departures[0]?.id ?? '');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [lead, setLead] = useState({ firstName: '', lastName: '' });
  const [contact, setContact] = useState({ email: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const total = useMemo(() => price * (adults + children), [price, adults, children]);
  const dateFmt = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    dateStyle: 'medium',
  });

  if (status === 'loading') {
    return <Card className="p-8 text-center text-muted-foreground">…</Card>;
  }

  if (status === 'unauthenticated') {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">{t('signInRequired')}</p>
        <Button asChild className="mt-5">
          <Link href="/login">{t('signInButton')}</Link>
        </Button>
      </Card>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const booking = await authFetch<BookingDetailDto>('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          packageId,
          departureId: departureId || undefined,
          adults,
          children,
          infants,
          contactEmail: contact.email,
          contactPhone: contact.phone,
          travelers: [{ firstName: lead.firstName, lastName: lead.lastName, isLead: true }],
        }),
      });
      router.push(`/bookings/${booking.id}/pay`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {departures.length > 0 && (
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t('departureLabel')}</label>
          <select
            value={departureId}
            onChange={(e) => setDepartureId(e.target.value)}
            className="h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {departures.map((d) => (
              <option key={d.id} value={d.id}>
                {dateFmt.format(new Date(d.departureDate))} — {t('seatsLeft', { count: d.seatsAvailable })}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Stepper label={t('adultsLabel')} value={adults} onChange={setAdults} min={1} />
        <Stepper label={t('childrenLabel')} value={children} onChange={setChildren} />
        <Stepper label={t('infantsLabel')} value={infants} onChange={setInfants} />
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">{t('leadTraveller')}</p>
        <div className="grid grid-cols-2 gap-3">
          <Input
            required
            placeholder={ta('firstName')}
            value={lead.firstName}
            onChange={(e) => setLead((l) => ({ ...l, firstName: e.target.value }))}
          />
          <Input
            required
            placeholder={ta('lastName')}
            value={lead.lastName}
            onChange={(e) => setLead((l) => ({ ...l, lastName: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          required
          type="email"
          placeholder={t('emailLabel')}
          value={contact.email}
          onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
        />
        <Input
          required
          placeholder={t('phoneLabel')}
          value={contact.phone}
          onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
        />
      </div>

      <Card className="space-y-2 p-5">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{t('priceEach')}</span>
          <span>{formatCurrency(price, currency, locale)}</span>
        </div>
        <div className="flex items-center justify-between text-lg font-bold">
          <span>{t('estimatedTotal')}</span>
          <span className="text-primary">{formatCurrency(total, currency, locale)}</span>
        </div>
        <p className="text-xs text-muted-foreground">{t('vatNote')}</p>
      </Card>

      {error && <p className="text-sm text-danger-600">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? t('submitting') : t('submit')}
      </Button>
    </form>
  );
}
