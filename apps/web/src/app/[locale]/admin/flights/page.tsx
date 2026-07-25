'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { FlightDto } from '@travel/types';
import { AdminPageHeader } from '@/components/admin/ui';
import { Badge } from '@/components/ui/badge';
import { AdminResourceTable, type Column } from '@/components/admin/admin-resource-table';
import { formatCurrency } from '@/lib/utils';

export default function AdminFlightsPage() {
  const t = useTranslations('admin');
  const locale = useLocale();

  const columns: Column<FlightDto>[] = [
    {
      header: t('cols.airline'),
      cell: (f) => (
        <div>
          <p className="font-medium">{f.airline}</p>
          <p className="text-xs text-muted-foreground">{f.flightNumber}</p>
        </div>
      ),
    },
    { header: t('cols.route'), cell: (f) => `${f.origin} → ${f.destination}` },
    { header: t('cols.cabin'), cell: (f) => <Badge variant="secondary">{f.cabinClass}</Badge> },
    {
      header: t('cols.price'),
      cell: (f) => formatCurrency(f.basePrice, f.currency, locale),
      className: 'text-end font-medium',
    },
  ];

  return (
    <div>
      <AdminPageHeader title={t('nav.flights')} />
      <AdminResourceTable path="/flights/admin/list" columns={columns} emptyLabel={t('empty')} />
    </div>
  );
}
