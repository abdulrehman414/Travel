import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MapPin, Users } from 'lucide-react';
import type { Paginated, TransportServiceDto } from '@travel/types';
import { PageHero } from '@/components/layout/page-hero';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { apiFetchSafe } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

const EMPTY: Paginated<TransportServiceDto> = {
  items: [],
  meta: { page: 1, limit: 50, total: 0, totalPages: 1, hasNext: false, hasPrev: false },
};

const GROUPS = ['AIRPORT_TRANSFER', 'INTERCITY', 'ZIYARAT', 'HOURLY', 'CITY_TOUR'] as const;

export default async function TransportationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale === 'ar';
  const t = await getTranslations('transportation');
  const tn = await getTranslations('nav');
  const data = await apiFetchSafe<Paginated<TransportServiceDto>>('/transport?limit=50', EMPTY);

  const unitLabel = (unit: string) =>
    unit === 'per_hour' ? t('perHour') : unit === 'per_day' ? t('perDay') : t('perTrip');

  return (
    <>
      <PageHero
        title={t('title')}
        subtitle={t('subtitle')}
        breadcrumbs={[{ label: tn('home'), href: '/' }, { label: t('title') }]}
      />
      <div className="container-px mx-auto max-w-[1360px] space-y-14 py-12">
        {GROUPS.map((type) => {
          const items = data.items.filter((s) => s.type === type);
          if (items.length === 0) return null;
          return (
            <section key={type}>
              <h2 className="mb-6 text-2xl font-bold">{t(`groups.${type}`)}</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {items.map((s) => {
                  const features = isAr ? s.featuresAr : s.featuresEn;
                  return (
                    <Card key={s.id} className="flex flex-col p-6">
                      <div className="flex items-center justify-between">
                        <Badge variant="gold">{t(`vehicles.${s.vehicleClass}`)}</Badge>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="size-3.5" /> {s.capacity}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-semibold">{isAr ? s.titleAr : s.titleEn}</h3>
                      {s.fromCity && s.toCity ? (
                        <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="size-3.5" /> {s.fromCity} → {s.toCity}
                        </p>
                      ) : (
                        s.city && (
                          <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="size-3.5" /> {s.city}
                            {s.durationHours ? ` · ${s.durationHours}h` : ''}
                          </p>
                        )
                      )}
                      <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                        {isAr ? s.descriptionAr : s.descriptionEn}
                      </p>
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {features.slice(0, 3).map((f) => (
                          <li key={f}>
                            <Badge variant="secondary">{f}</Badge>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                        <div>
                          <span className="text-lg font-bold text-primary">
                            {formatCurrency(s.basePrice, s.currency, locale)}
                          </span>{' '}
                          <span className="text-xs text-muted-foreground">
                            {unitLabel(s.pricingUnit)}
                          </span>
                        </div>
                        <Button asChild size="sm">
                          <Link href="/contact">{t('enquire')}</Link>
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
