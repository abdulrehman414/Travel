import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { PackageListItemDto, Paginated } from '@travel/types';
import { PageHero } from '@/components/layout/page-hero';
import { PackageCard } from '@/components/package-card';
import { PackageFilters } from '@/components/packages/package-filters';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { apiFetchSafe } from '@/lib/api-client';

const EMPTY: Paginated<PackageListItemDto> = {
  items: [],
  meta: { page: 1, limit: 9, total: 0, totalPages: 1, hasNext: false, hasPrev: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function pageHref(base: Record<string, string>, page: number): string {
  const sp = new URLSearchParams(base);
  sp.set('page', String(page));
  return `/packages?${sp.toString()}`;
}

export default async function PackagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations('packages');
  const tn = await getTranslations('nav');

  const type = typeof sp.type === 'string' ? sp.type : '';
  const search = typeof sp.search === 'string' ? sp.search : '';
  const page = Math.max(1, Number(typeof sp.page === 'string' ? sp.page : '1') || 1);

  const query = new URLSearchParams({ limit: '9', page: String(page) });
  if (type) query.set('type', type);
  if (search) query.set('search', search);
  const data = await apiFetchSafe<Paginated<PackageListItemDto>>(
    `/packages?${query.toString()}`,
    EMPTY,
  );

  const baseParams: Record<string, string> = { limit: '9' };
  if (type) baseParams.type = type;
  if (search) baseParams.search = search;

  return (
    <>
      <PageHero
        title={t('title')}
        subtitle={t('subtitle')}
        breadcrumbs={[{ label: tn('home'), href: '/' }, { label: t('title') }]}
      />
      <section className="container-px mx-auto max-w-[1360px] py-12">
        <PackageFilters activeType={type} search={search} />

        {data.items.length === 0 ? (
          <p className="py-24 text-center text-muted-foreground">{t('empty')}</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} locale={locale} />
            ))}
          </div>
        )}

        {data.meta.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            {data.meta.hasPrev ? (
              <Button asChild variant="outline">
                <Link href={pageHref(baseParams, page - 1)}>{t('prev')}</Link>
              </Button>
            ) : (
              <Button variant="outline" disabled>
                {t('prev')}
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              {data.meta.page} / {data.meta.totalPages}
            </span>
            {data.meta.hasNext ? (
              <Button asChild variant="outline">
                <Link href={pageHref(baseParams, page + 1)}>{t('next')}</Link>
              </Button>
            ) : (
              <Button variant="outline" disabled>
                {t('next')}
              </Button>
            )}
          </div>
        )}
      </section>
    </>
  );
}
