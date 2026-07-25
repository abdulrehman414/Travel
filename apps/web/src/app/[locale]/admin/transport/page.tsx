'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { TransportServiceDto } from '@travel/types';
import { AdminPageHeader } from '@/components/admin/ui';
import { Badge } from '@/components/ui/badge';
import { AdminResourceTable, type Column } from '@/components/admin/admin-resource-table';
import { formatCurrency } from '@/lib/utils';

export default function AdminTransportPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const columns: Column<TransportServiceDto>[] = [
    {
      header: t('cols.name'),
      cell: (s) => <span className="font-medium">{isAr ? s.titleAr : s.titleEn}</span>,
    },
    { header: t('cols.type'), cell: (s) => s.type.replace(/_/g, ' ') },
    { header: t('cols.vehicle'), cell: (s) => <Badge variant="secondary">{s.vehicleClass}</Badge> },
    {
      header: t('cols.price'),
      cell: (s) => formatCurrency(s.basePrice, s.currency, locale),
      className: 'text-end font-medium',
    },
    { header: t('cols.featured'), cell: (s) => (s.featured ? <Badge variant="gold">★</Badge> : '—') },
  ];

  return (
    <div>
      <AdminPageHeader title={t('nav.transport')} />
      <AdminResourceTable path="/transport/admin/list" columns={columns} emptyLabel={t('empty')} />
    </div>
  );
}
