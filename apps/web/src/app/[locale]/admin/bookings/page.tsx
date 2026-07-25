'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { BookingListItemDto } from '@travel/types';
import { AdminPageHeader, StatusPill } from '@/components/admin/ui';
import { AdminResourceTable, type Column } from '@/components/admin/admin-resource-table';
import { formatCurrency } from '@/lib/utils';

export default function AdminBookingsPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const dateFmt = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', { dateStyle: 'medium' });

  const columns: Column<BookingListItemDto>[] = [
    { header: t('cols.reference'), cell: (b) => <span className="font-medium">{b.reference}</span> },
    { header: t('cols.status'), cell: (b) => <StatusPill status={b.status} /> },
    { header: t('cols.travellers'), cell: (b) => b.adults + b.children + b.infants },
    {
      header: t('cols.total'),
      cell: (b) => formatCurrency(b.grandTotal, b.currency, locale),
      className: 'text-end font-medium',
    },
    {
      header: t('cols.date'),
      cell: (b) => <span className="text-muted-foreground">{dateFmt.format(new Date(b.createdAt))}</span>,
    },
  ];

  return (
    <div>
      <AdminPageHeader title={t('nav.bookings')} />
      <AdminResourceTable path="/bookings/admin/list" columns={columns} emptyLabel={t('empty')} />
    </div>
  );
}
