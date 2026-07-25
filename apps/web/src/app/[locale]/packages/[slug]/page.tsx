import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Check, Clock, MapPin, Star, Users, X } from 'lucide-react';
import type { PackageDetailDto, Paginated, ReviewDto } from '@travel/types';
import { Breadcrumbs } from '@/components/layout/page-hero';
import { JsonLd } from '@/components/json-ld';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import { apiFetchSafe } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

const REVIEWS_EMPTY: Paginated<ReviewDto> = {
  items: [],
  meta: { page: 1, limit: 5, total: 0, totalPages: 1, hasNext: false, hasPrev: false },
};

async function getPackage(slug: string): Promise<PackageDetailDto | null> {
  return apiFetchSafe<PackageDetailDto | null>(`/packages/${slug}`, null);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const pkg = await getPackage(slug);
  if (!pkg) return {};
  const title = locale === 'ar' ? pkg.titleAr : pkg.titleEn;
  const description = locale === 'ar' ? pkg.summaryAr : pkg.summaryEn;
  return { title, description, openGraph: { title, description } };
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const isAr = locale === 'ar';

  const pkg = await getPackage(slug);
  if (!pkg) notFound();

  const t = await getTranslations('packageDetail');
  const tn = await getTranslations('nav');

  const reviews = await apiFetchSafe<Paginated<ReviewDto>>(
    `/reviews?packageId=${pkg.id}&limit=5`,
    REVIEWS_EMPTY,
  );

  const title = isAr ? pkg.titleAr : pkg.titleEn;
  const description = isAr ? pkg.descriptionAr : pkg.descriptionEn;
  const price = pkg.salePrice ?? pkg.basePrice;
  const included = pkg.inclusions.filter((i) => i.type === 'INCLUDED');
  const excluded = pkg.inclusions.filter((i) => i.type === 'EXCLUDED');
  const openDepartures = pkg.departures.filter((d) => d.status === 'OPEN' || d.status === 'SCHEDULED');
  const dateFmt = new Intl.DateTimeFormat(isAr ? 'ar-SA' : 'en-US', { dateStyle: 'medium' });

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TouristTrip',
          name: title,
          description: isAr ? pkg.summaryAr : pkg.summaryEn,
          offers: {
            '@type': 'Offer',
            price,
            priceCurrency: pkg.currency,
            availability: 'https://schema.org/InStock',
          },
          ...(pkg.reviewCount > 0
            ? {
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: pkg.rating,
                  reviewCount: pkg.reviewCount,
                },
              }
            : {}),
        }}
      />
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-brand-gradient">
        <div className="absolute inset-0 bg-hero-overlay opacity-60" />
        <div className="container-px relative mx-auto max-w-[1360px] py-14">
          <Breadcrumbs
            items={[
              { label: tn('home'), href: '/' },
              { label: t('backToPackages'), href: '/packages' },
              { label: title },
            ]}
            light
          />
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {pkg.destination && (
              <Badge variant="gold">
                <MapPin className="size-3" /> {isAr ? pkg.destination.nameAr : pkg.destination.nameEn}
              </Badge>
            )}
            <span className="inline-flex items-center gap-1 text-sm text-white/90">
              <Star className="size-4 fill-gold-400 text-gold-400" /> {pkg.rating} ({pkg.reviewCount})
            </span>
          </div>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold text-white text-balance sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-white/80">{isAr ? pkg.summaryAr : pkg.summaryEn}</p>
        </div>
      </section>

      <div className="container-px mx-auto grid max-w-[1360px] gap-10 py-12 lg:grid-cols-[1fr_360px]">
        {/* Main */}
        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-bold">{t('overview')}</h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">{description}</p>
          </section>

          {pkg.itinerary.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold">{t('itinerary')}</h2>
              <ol className="mt-5 space-y-4">
                {pkg.itinerary.map((day) => (
                  <li key={day.id} className="flex gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                      {day.dayNumber}
                    </span>
                    <div>
                      <h3 className="font-semibold">{isAr ? day.titleAr : day.titleEn}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {isAr ? day.descriptionAr : day.descriptionEn}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {(included.length > 0 || excluded.length > 0) && (
            <section className="grid gap-8 sm:grid-cols-2">
              {included.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold">{t('included')}</h2>
                  <ul className="mt-4 space-y-2.5">
                    {included.map((item) => (
                      <li key={item.id} className="flex items-start gap-2.5 text-sm">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        {isAr ? item.labelAr : item.labelEn}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {excluded.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold">{t('excluded')}</h2>
                  <ul className="mt-4 space-y-2.5">
                    {excluded.map((item) => (
                      <li key={item.id} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <X className="mt-0.5 size-4 shrink-0 text-danger-500" />
                        {isAr ? item.labelAr : item.labelEn}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          <section>
            <h2 className="text-2xl font-bold">{t('reviews')}</h2>
            {reviews.items.length === 0 ? (
              <p className="mt-4 text-muted-foreground">{t('noReviews')}</p>
            ) : (
              <div className="mt-5 space-y-4">
                {reviews.items.map((review) => (
                  <Card key={review.id} className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">
                        {review.user ? `${review.user.firstName} ${review.user.lastName}` : 'Traveller'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm">
                        <Star className="size-4 fill-gold-500 text-gold-500" /> {review.rating}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            <div className="flex items-end gap-2">
              <span className="text-sm text-muted-foreground">{t('from')}</span>
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(price, pkg.currency, locale)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{t('perPerson')}</p>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <dt className="text-muted-foreground">{t('duration')}:</dt>
                <dd className="font-medium">
                  {pkg.durationDays} {t('days')} · {pkg.durationNights} {t('nights')}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                <dd className="font-medium">{t('groupSize', { count: pkg.maxGroupSize })}</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-col gap-2">
              <Button asChild size="lg">
                <Link href={`/packages/${pkg.slug}/book`}>{t('bookNow')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">{t('enquire')}</Link>
              </Button>
            </div>
          </Card>

          {openDepartures.length > 0 && (
            <Card className="mt-5 p-6">
              <h3 className="font-semibold">{t('departures')}</h3>
              <ul className="mt-4 space-y-3">
                {openDepartures.map((dep) => (
                  <li key={dep.id} className="flex items-center justify-between text-sm">
                    <span>{dateFmt.format(new Date(dep.departureDate))}</span>
                    <Badge variant="success">{t('seatsLeft', { count: dep.seatsAvailable })}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </aside>
      </div>
    </>
  );
}
