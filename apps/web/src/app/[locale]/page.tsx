import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  ArrowRight,
  BedDouble,
  Building2,
  Car,
  ChevronDown,
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
import { ImmersiveShell } from '@/components/immersive/immersive-shell';
import { KineticHeading } from '@/components/immersive/kinetic-heading';
import { Reveal } from '@/components/immersive/reveal';
import { CountUp } from '@/components/immersive/count-up';

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
    <ImmersiveShell>
      {/* ---------------- HERO ---------------- */}
      <section className="relative flex min-h-[92vh] items-center">
        <div className="container-px mx-auto max-w-[1360px] py-24 text-center">
          <Reveal>
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-white/90">
              <Sparkles className="size-4 text-gold-300" /> {t('heroEyebrow')}
            </span>
          </Reveal>

          <h1 className="mx-auto mt-7 max-w-4xl font-display text-4xl font-bold leading-[1.05] text-balance sm:text-6xl lg:text-7xl">
            <KineticHeading text={t('heroTitle')} wordClassName="aurora-text" />
          </h1>

          <Reveal delay={0.5}>
            <p className="immersive-muted mx-auto mt-7 max-w-2xl text-lg">{t('heroSubtitle')}</p>
          </Reveal>

          <Reveal delay={0.65}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" variant="gold">
                <Link href="/packages">
                  {t('heroCtaPrimary')}{' '}
                  <ArrowRight className={cn('size-4', isAr && 'rotate-180')} />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="glass border-white/25 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/umrah">{t('heroCtaSecondary')}</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.8}>
            <dl className="glass mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-2 rounded-2xl px-4 py-6">
              <div>
                <dt className="font-display text-3xl font-bold text-gold-300">
                  <CountUp value={25} suffix="k+" />
                </dt>
                <dd className="immersive-muted mt-1 text-sm">{t('statPilgrims')}</dd>
              </div>
              <div className="border-x border-white/10">
                <dt className="font-display text-3xl font-bold text-gold-300">
                  <CountUp value={180} suffix="+" />
                </dt>
                <dd className="immersive-muted mt-1 text-sm">{t('statHotels')}</dd>
              </div>
              <div>
                <dt className="font-display text-3xl font-bold text-gold-300">4.9★</dt>
                <dd className="immersive-muted mt-1 text-sm">{t('statRating')}</dd>
              </div>
            </dl>
          </Reveal>

          <div className="scroll-cue immersive-muted mx-auto mt-14 flex w-fit flex-col items-center gap-1 text-xs uppercase tracking-widest">
            <ChevronDown className="size-5" />
          </div>
        </div>
      </section>

      {/* ---------------- FEATURED PACKAGES ---------------- */}
      {featured.items.length > 0 && (
        <section className="container-px mx-auto max-w-[1360px] py-20">
          <Reveal className="mb-12 text-center">
            <h2 className="immersive-copy font-display text-3xl font-bold sm:text-4xl">
              {t('featuredTitle')}
            </h2>
            <p className="immersive-muted mt-3">{t('featuredSubtitle')}</p>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.items.map((pkg, i) => {
              const title = isAr ? pkg.titleAr : pkg.titleEn;
              const summary = isAr ? pkg.summaryAr : pkg.summaryEn;
              const price = pkg.salePrice ?? pkg.basePrice;
              return (
                <Reveal key={pkg.id} delay={i * 0.08}>
                  <Link
                    href={`/packages/${pkg.slug}`}
                    className="glass-panel group block h-full overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1.5"
                  >
                    <div className="relative flex h-44 items-end bg-brand-gradient p-4">
                      <div className="absolute inset-0 bg-hero-overlay" />
                      {pkg.destination && (
                        <span className="glass relative inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white">
                          <MapPin className="size-3" />{' '}
                          {isAr ? pkg.destination.nameAr : pkg.destination.nameEn}
                        </span>
                      )}
                      {pkg.salePrice && (
                        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-gold-500 px-2.5 py-1 text-xs font-bold text-ink-900">
                          <Tag className="size-3" /> Sale
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="immersive-muted flex items-center gap-3 text-xs">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3.5" /> {pkg.durationDays}d / {pkg.durationNights}n
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Star className="size-3.5 fill-gold-400 text-gold-400" /> {pkg.rating} (
                          {pkg.reviewCount})
                        </span>
                      </div>
                      <h3 className="immersive-copy mt-2 line-clamp-1 text-lg font-semibold">
                        {title}
                      </h3>
                      <p className="immersive-muted mt-1 line-clamp-2 text-sm">{summary}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-gold-300">
                            {formatCurrency(price, pkg.currency, locale)}
                          </span>
                          <span className="immersive-muted text-xs"> / person</span>
                        </div>
                        <ArrowRight
                          className={cn(
                            'size-5 text-gold-300 transition-transform group-hover:translate-x-1',
                            isAr && 'rotate-180 group-hover:-translate-x-1',
                          )}
                        />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {/* ---------------- SERVICES ---------------- */}
      <section className="container-px mx-auto max-w-[1360px] py-20">
        <Reveal className="mb-12 text-center">
          <h2 className="immersive-copy font-display text-3xl font-bold sm:text-4xl">
            {t('servicesTitle')}
          </h2>
          <p className="immersive-muted mt-3">{t('servicesSubtitle')}</p>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(SERVICE_ICONS) as Array<keyof typeof SERVICE_ICONS>).map((key, i) => {
            const Icon = SERVICE_ICONS[key];
            return (
              <Reveal key={key} delay={i * 0.05}>
                <div className="glass-panel h-full rounded-2xl p-6 transition-all duration-300">
                  <span className="grid size-12 place-items-center rounded-xl bg-gold-gradient text-ink-900">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="immersive-copy mt-4 text-lg font-semibold">{ts(`${key}.title`)}</h3>
                  <p className="immersive-muted mt-1.5 text-sm">{ts(`${key}.desc`)}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------------- WHY US ---------------- */}
      <section className="container-px mx-auto max-w-[1360px] py-20">
        <Reveal className="mb-12 text-center">
          <h2 className="immersive-copy font-display text-3xl font-bold sm:text-4xl">
            {t('whyTitle')}
          </h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { key: 'concierge', Icon: HeartHandshake },
            { key: 'value', Icon: Tag },
            { key: 'trusted', Icon: ShieldCheck },
          ].map(({ key, Icon }, i) => (
            <Reveal key={key} delay={i * 0.08}>
              <div className="glass-panel h-full rounded-2xl p-8 text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-gold-gradient text-ink-900">
                  <Icon className="size-7" />
                </span>
                <h3 className="immersive-copy mt-5 text-lg font-semibold">{tw(`${key}.title`)}</h3>
                <p className="immersive-muted mt-2 text-sm">{tw(`${key}.desc`)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="container-px mx-auto max-w-[1360px] pb-28">
        <Reveal>
          <div className="glass-panel relative overflow-hidden rounded-3xl px-8 py-16 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(231,200,106,0.18),transparent)]" />
            <h2 className="immersive-copy relative font-display text-3xl font-bold sm:text-4xl">
              {t('ctaTitle')}
            </h2>
            <p className="immersive-muted relative mx-auto mt-4 max-w-xl">{t('ctaSubtitle')}</p>
            <Button asChild size="lg" variant="gold" className="relative mt-8">
              <Link href="/contact">{t('ctaButton')}</Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </ImmersiveShell>
  );
}
