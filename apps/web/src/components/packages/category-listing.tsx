import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { PackageListItemDto, Paginated } from '@travel/types';
import { PageHero } from '@/components/layout/page-hero';
import { PackageCard } from '@/components/package-card';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { apiFetchSafe } from '@/lib/api-client';

const EMPTY: Paginated<PackageListItemDto> = {
  items: [],
  meta: { page: 1, limit: 12, total: 0, totalPages: 1, hasNext: false, hasPrev: false },
};

export async function CategoryListing({
  locale,
  type,
  titleKey,
  subtitleKey,
}: {
  locale: string;
  type: string;
  titleKey: string;
  subtitleKey: string;
}) {
  setRequestLocale(locale);
  const t = await getTranslations('categories');
  const tn = await getTranslations('nav');
  const data = await apiFetchSafe<Paginated<PackageListItemDto>>(
    `/packages?type=${type}&limit=12`,
    EMPTY,
  );

  return (
    <>
      <PageHero
        title={t(titleKey)}
        subtitle={t(subtitleKey)}
        breadcrumbs={[{ label: tn('home'), href: '/' }, { label: t(titleKey) }]}
      />
      <section className="container-px mx-auto max-w-[1360px] py-12">
        {data.items.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-muted-foreground">{t('empty')}</p>
            <Button asChild className="mt-6">
              <Link href="/packages">{t('viewAll')}</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} locale={locale} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
