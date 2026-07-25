import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/layout/page-hero';

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('legal');
  const tn = await getTranslations('nav');

  return (
    <>
      <PageHero
        title={t('termsTitle')}
        breadcrumbs={[{ label: tn('home'), href: '/' }, { label: t('termsTitle') }]}
      />
      <section className="container-px mx-auto max-w-3xl py-16">
        <div className="whitespace-pre-line leading-relaxed text-muted-foreground">
          {t('termsBody')}
        </div>
      </section>
    </>
  );
}
