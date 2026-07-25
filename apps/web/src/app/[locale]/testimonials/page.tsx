import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Quote, Star } from 'lucide-react';
import type { Paginated, TestimonialDto } from '@travel/types';
import { PageHero } from '@/components/layout/page-hero';
import { Card } from '@/components/ui/card';
import { apiFetchSafe } from '@/lib/api-client';

const EMPTY: Paginated<TestimonialDto> = {
  items: [],
  meta: { page: 1, limit: 24, total: 0, totalPages: 1, hasNext: false, hasPrev: false },
};

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default async function TestimonialsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale === 'ar';
  const t = await getTranslations('testimonialsPage');
  const tn = await getTranslations('nav');
  const data = await apiFetchSafe<Paginated<TestimonialDto>>('/testimonials?limit=24', EMPTY);

  return (
    <>
      <PageHero
        title={t('title')}
        subtitle={t('subtitle')}
        breadcrumbs={[{ label: tn('home'), href: '/' }, { label: t('title') }]}
      />
      <section className="container-px mx-auto max-w-[1360px] py-16">
        {data.items.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">{t('empty')}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((item) => (
              <Card key={item.id} className="flex flex-col p-6">
                <Quote className="size-8 text-gold-500" />
                <p className="mt-4 flex-1 leading-relaxed text-foreground/90">
                  “{isAr ? item.quoteAr : item.quoteEn}”
                </p>
                <div className="mt-5 flex items-center gap-1">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="size-4 fill-gold-500 text-gold-500" />
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                  <span className="grid size-11 place-items-center rounded-full bg-brand-gradient text-sm font-bold text-white">
                    {initials(item.authorName)}
                  </span>
                  <div>
                    <p className="font-semibold">{item.authorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {[item.authorTitle, item.country].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
