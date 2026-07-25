import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  ArrowRight,
  BedDouble,
  Building2,
  Car,
  Clock,
  HeartHandshake,
  MapPin,
  Plane,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
} from 'lucide-react';
import type { PackageListItemDto, Paginated } from '@travel/types';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { apiFetchSafe } from '@/lib/api-client';
import { cn, formatCurrency } from '@/lib/utils';

const EMPTY: Paginated<PackageListItemDto> = {
  items: [],
  meta: { page: 1, limit: 3, total: 0, totalPages: 1, hasNext: false, hasPrev: false },
};

const SERVICE_ICONS = {
  hajj: Sparkles,
  umrah: MapPin,
  tours: Building2,
  hotels: BedDouble,
  flights: Plane,
  transport: Car,
  visa: ShieldCheck,
} as const;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const ts = await getTranslations('services');
  const tw = await getTranslations('why');
  const isAr = locale === 'ar';

  const featured = await apiFetchSafe<Paginated<PackageListItemDto>>(
    '/packages?featured=true&limit=3',
    EMPTY,
  );

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(212,175,55,0.25),transparent)]" />
        <div className="container-px relative mx-auto max-w-[1360px] py-24 text-center lg:py-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur">
            <Sparkles className="size-4 text-gold-300" /> {t('heroEyebrow')}
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl font-display text-4xl font-bold leading-tight text-white text-balance sm:text-5xl lg:text-6xl">
            {t('heroTitle')}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">{t('heroSubtitle')}</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="gold">
              <Link href="/packages">
                {t('heroCtaPrimary')} <ArrowRight className={cn('size-4', isAr && 'rotate-180')} />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link href="/umrah">{t('heroCtaSecondary')}</Link>
            </Button>
          </div>
          <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-6 text-white">
            {[
              { v: '25k+', k: t('statPilgrims') },
              { v: '180+', k: t('statHotels') },
              { v: '4.9★', k: t('statRating') },
            ].map((s) => (
              <div key={s.k}>
                <dt className="font-display text-3xl font-bold text-gold-300">{s.v}</dt>
                <dd className="mt-1 text-sm text-white/70">{s.k}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Featured packages */}
      {featured.items.length > 0 && (
        <section className="container-px mx-auto max-w-[1360px] py-20">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">{t('featuredTitle')}</h2>
            <p className="mt-3 text-muted-foreground">{t('featuredSubtitle')}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.items.map((pkg) => {
              const title = isAr ? pkg.titleAr : pkg.titleEn;
              const summary = isAr ? pkg.summaryAr : pkg.summaryEn;
              const price = pkg.salePrice ?? pkg.basePrice;
              return (
                <Link
                  key={pkg.id}
                  href={`/packages/${pkg.slug}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
                >
                  <div className="relative flex h-44 items-end bg-brand-gradient p-4">
                    <div className="absolute inset-0 bg-hero-overlay" />
                    {pkg.destination && (
                      <span className="relative inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                        <MapPin className="size-3" /> {isAr ? pkg.destination.nameAr : pkg.destination.nameEn}
                      </span>
                    )}
                    {pkg.salePrice && (
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-gold-500 px-2.5 py-1 text-xs font-bold text-ink-900">
                        <Tag className="size-3" /> Sale
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" /> {pkg.durationDays}d / {pkg.durationNights}n
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Star className="size-3.5 fill-gold-500 text-gold-500" /> {pkg.rating} ({pkg.reviewCount})
                      </span>
                    </div>
                    <h3 className="mt-2 line-clamp-1 text-lg font-semibold">{title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{summary}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(price, pkg.currency, locale)}
                        </span>
                        <span className="text-xs text-muted-foreground"> / person</span>
                      </div>
                      <ArrowRight
                        className={cn(
                          'size-5 text-primary transition-transform group-hover:translate-x-1',
                          isAr && 'rotate-180 group-hover:-translate-x-1',
                        )}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Services */}
      <section className="border-y border-border bg-secondary/30">
        <div className="container-px mx-auto max-w-[1360px] py-20">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">{t('servicesTitle')}</h2>
            <p className="mt-3 text-muted-foreground">{t('servicesSubtitle')}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(SERVICE_ICONS) as Array<keyof typeof SERVICE_ICONS>).map((key) => {
              const Icon = SERVICE_ICONS[key];
              return (
                <div
                  key={key}
                  className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-card"
                >
                  <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{ts(`${key}.title`)}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{ts(`${key}.desc`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="container-px mx-auto max-w-[1360px] py-20">
        <h2 className="mb-10 text-center font-display text-3xl font-bold sm:text-4xl">
          {t('whyTitle')}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { key: 'concierge', Icon: HeartHandshake },
            { key: 'value', Icon: Tag },
            { key: 'trusted', Icon: ShieldCheck },
          ].map(({ key, Icon }) => (
            <div key={key} className="rounded-2xl border border-border bg-card p-8 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-gold-gradient text-ink-900">
                <Icon className="size-7" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{tw(`${key}.title`)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{tw(`${key}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-px mx-auto max-w-[1360px] pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-8 py-16 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_0%,rgba(212,175,55,0.25),transparent)]" />
          <h2 className="relative font-display text-3xl font-bold text-white sm:text-4xl">
            {t('ctaTitle')}
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/80">{t('ctaSubtitle')}</p>
          <Button asChild size="lg" variant="gold" className="relative mt-8">
            <Link href="/contact">{t('ctaButton')}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
