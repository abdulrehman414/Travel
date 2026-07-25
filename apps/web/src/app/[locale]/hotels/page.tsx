import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { HotelListItemDto, Paginated } from '@travel/types';
import { PageHero } from '@/components/layout/page-hero';
import { HotelCard } from '@/components/hotel-card';
import { apiFetchSafe } from '@/lib/api-client';

const EMPTY: Paginated<HotelListItemDto> = {
  items: [],
  meta: { page: 1, limit: 12, total: 0, totalPages: 1, hasNext: false, hasPrev: false },
};

export default async function HotelsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('hotels');
  const tn = await getTranslations('nav');
  const data = await apiFetchSafe<Paginated<HotelListItemDto>>('/hotels?limit=12', EMPTY);

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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} locale={locale} perNightLabel={t('perNight')} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
