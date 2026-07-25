'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Star } from 'lucide-react';
import type { PackageListItemDto } from '@travel/types';
import { AdminPageHeader, StatusPill } from '@/components/admin/ui';
import { AdminResourceTable, type Column } from '@/components/admin/admin-resource-table';
import { formatCurrency } from '@/lib/utils';

export default function AdminPackagesPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const columns: Column<PackageListItemDto>[] = [
    {
      header: t('cols.name'),
      cell: (p) => <span className="font-medium">{isAr ? p.titleAr : p.titleEn}</span>,
    },
    { header: t('cols.type'), cell: (p) => p.type.replace(/_/g, ' ') },
    { header: t('cols.status'), cell: (p) => <StatusPill status={p.status} /> },
    {
      header: t('cols.rating'),
      cell: (p) => (
        <span className="inline-flex items-center gap-1">
          <Star className="size-3.5 fill-gold-500 text-gold-500" /> {p.rating} ({p.reviewCount})
        </span>
      ),
    },
    {
      header: t('cols.price'),
      cell: (p) => formatCurrency(p.salePrice ?? p.basePrice, p.currency, locale),
      className: 'text-end font-medium',
    },
  ];

  return (
    <div>
      <AdminPageHeader title={t('nav.packages')} />
      <AdminResourceTable path="/packages/admin/list" columns={columns} emptyLabel={t('empty')} />
    </div>
  );
}
