'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { FaqDto } from '@travel/types';
import { AdminPageHeader } from '@/components/admin/ui';
import { Badge } from '@/components/ui/badge';
import { AdminResourceTable, type Column } from '@/components/admin/admin-resource-table';

export default function AdminFaqsPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const columns: Column<FaqDto>[] = [
    {
      header: t('cols.question'),
      cell: (f) => (
        <span className="line-clamp-1 max-w-lg font-medium">{isAr ? f.questionAr : f.questionEn}</span>
      ),
    },
    { header: t('cols.category'), cell: (f) => <Badge variant="secondary">{f.category}</Badge> },
    { header: t('cols.order'), cell: (f) => f.order },
    {
      header: t('cols.published'),
      cell: (f) => (f.published ? <Badge variant="success">✓</Badge> : '—'),
    },
  ];

  return (
    <div>
      <AdminPageHeader title={t('nav.faqs')} />
      <AdminResourceTable path="/faqs/admin/list" columns={columns} emptyLabel={t('empty')} />
    </div>
  );
}
