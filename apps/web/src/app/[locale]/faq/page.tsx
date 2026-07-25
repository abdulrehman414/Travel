import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { FaqDto, Paginated } from '@travel/types';
import { PageHero } from '@/components/layout/page-hero';
import { FaqAccordion } from '@/components/faq-accordion';
import { apiFetchSafe } from '@/lib/api-client';

const EMPTY: Paginated<FaqDto> = {
  items: [],
  meta: { page: 1, limit: 100, total: 0, totalPages: 1, hasNext: false, hasPrev: false },
};

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale === 'ar';
  const t = await getTranslations('faqPage');
  const tn = await getTranslations('nav');
  const data = await apiFetchSafe<Paginated<FaqDto>>('/faqs?limit=100', EMPTY);

  const items = data.items.map((faq) => ({
    id: faq.id,
    question: isAr ? faq.questionAr : faq.questionEn,
    answer: isAr ? faq.answerAr : faq.answerEn,
  }));

  return (
    <>
      <PageHero
        title={t('title')}
        subtitle={t('subtitle')}
        breadcrumbs={[{ label: tn('home'), href: '/' }, { label: t('title') }]}
      />
      <section className="container-px mx-auto max-w-3xl py-16">
        {items.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">{t('empty')}</p>
        ) : (
          <FaqAccordion items={items} />
        )}
      </section>
    </>
  );
}
