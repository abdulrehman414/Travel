import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight, Plane } from 'lucide-react';
import type { FlightDto, Paginated } from '@travel/types';
import { PageHero } from '@/components/layout/page-hero';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { apiFetchSafe } from '@/lib/api-client';
import { cn, formatCurrency } from '@/lib/utils';

const EMPTY: Paginated<FlightDto> = {
  items: [],
  meta: { page: 1, limit: 12, total: 0, totalPages: 1, hasNext: false, hasPrev: false },
};

export default async function FlightsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale === 'ar';
  const t = await getTranslations('flights');
  const tn = await getTranslations('nav');
  const data = await apiFetchSafe<Paginated<FlightDto>>('/flights?limit=12', EMPTY);

  const timeFmt = new Intl.DateTimeFormat(isAr ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateFmt = new Intl.DateTimeFormat(isAr ? 'ar-SA' : 'en-US', { dateStyle: 'medium' });

  return (
    <>
      <PageHero
        title={t('title')}
        subtitle={t('subtitle')}
        breadcrumbs={[{ label: tn('home'), href: '/' }, { label: t('title') }]}
      />
      <section className="container-px mx-auto max-w-[1360px] py-12">
        {data.items.length === 0 ? (
          <p className="py-24 text-center text-muted-foreground">{t('empty')}</p>
        ) : (
          <div className="space-y-4">
            {data.items.map((flight) => (
              <Card key={flight.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Plane className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold">{flight.airline}</p>
                    <p className="text-xs text-muted-foreground">{flight.flightNumber}</p>
                  </div>
                </div>

                <div className="flex flex-1 items-center justify-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold">{flight.origin}</p>
                    <p className="text-xs text-muted-foreground">
                      {timeFmt.format(new Date(flight.departureTime))}
                    </p>
                  </div>
                  <ArrowRight className={cn('size-5 text-muted-foreground', isAr && 'rotate-180')} />
                  <div className="text-center">
                    <p className="text-lg font-bold">{flight.destination}</p>
                    <p className="text-xs text-muted-foreground">
                      {timeFmt.format(new Date(flight.arrivalTime))}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <Badge variant="gold">{flight.cabinClass}</Badge>
                  <div className="text-end">
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(flight.basePrice, flight.currency, locale)}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {dateFmt.format(new Date(flight.departureTime))}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
