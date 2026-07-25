'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { PostListItemDto } from '@travel/types';
import { AdminPageHeader, StatusPill } from '@/components/admin/ui';
import { AdminResourceTable, type Column } from '@/components/admin/admin-resource-table';

export default function AdminPostsPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const columns: Column<PostListItemDto>[] = [
    {
      header: t('cols.name'),
      cell: (p) => <span className="font-medium">{isAr ? p.titleAr : p.titleEn}</span>,
    },
    { header: t('cols.status'), cell: (p) => <StatusPill status={p.status} /> },
    { header: t('cols.views'), cell: (p) => p.views },
    {
      header: t('cols.readMin'),
      cell: (p) => `${p.readMinutes} min`,
    },
  ];

  return (
    <div>
      <AdminPageHeader title={t('nav.posts')} />
      <AdminResourceTable path="/posts/admin/list" columns={columns} emptyLabel={t('empty')} />
    </div>
  );
}
