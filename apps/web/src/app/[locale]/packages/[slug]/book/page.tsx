import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { PackageDetailDto } from '@travel/types';
import { PageHero } from '@/components/layout/page-hero';
import { BookingForm } from '@/components/booking/booking-form';
import { apiFetchSafe } from '@/lib/api-client';

export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const isAr = locale === 'ar';
  const pkg = await apiFetchSafe<PackageDetailDto | null>(`/packages/${slug}`, null);
  if (!pkg) notFound();

  const t = await getTranslations('booking');
  const tn = await getTranslations('nav');
  const title = isAr ? pkg.titleAr : pkg.titleEn;
  const price = pkg.salePrice ?? pkg.basePrice;

  return (
    <>
      <PageHero
        title={t('title')}
        subtitle={title}
        breadcrumbs={[
          { label: tn('home'), href: '/' },
          { label: title, href: `/packages/${pkg.slug}` },
          { label: t('title') },
        ]}
      />
      <section className="container-px mx-auto max-w-2xl py-12">
        <BookingForm
          packageId={pkg.id}
          price={price}
          currency={pkg.currency}
          departures={pkg.departures.filter((d) => d.status === 'OPEN' || d.status === 'SCHEDULED')}
        />
      </section>
    </>
  );
}
