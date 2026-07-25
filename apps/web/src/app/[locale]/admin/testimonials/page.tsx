'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Star } from 'lucide-react';
import type { TestimonialDto } from '@travel/types';
import { AdminPageHeader, StatusPill } from '@/components/admin/ui';
import { Badge } from '@/components/ui/badge';
import { AdminResourceTable, type Column } from '@/components/admin/admin-resource-table';

export default function AdminTestimonialsPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const columns: Column<TestimonialDto>[] = [
    { header: t('cols.name'), cell: (t2) => <span className="font-medium">{t2.authorName}</span> },
    {
      header: t('cols.quote'),
      cell: (t2) => (
        <span className="line-clamp-1 max-w-md text-muted-foreground">
          {isAr ? t2.quoteAr : t2.quoteEn}
        </span>
      ),
    },
    {
      header: t('cols.rating'),
      cell: (t2) => (
        <span className="inline-flex items-center gap-1">
          <Star className="size-3.5 fill-gold-500 text-gold-500" /> {t2.rating}
        </span>
      ),
    },
    { header: t('cols.status'), cell: (t2) => <StatusPill status={t2.status} /> },
    { header: t('cols.featured'), cell: (t2) => (t2.featured ? <Badge variant="gold">★</Badge> : '—') },
  ];

  return (
    <div>
      <AdminPageHeader title={t('nav.testimonials')} />
      <AdminResourceTable path="/testimonials/admin/list" columns={columns} emptyLabel={t('empty')} />
    </div>
  );
}
