'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { PaymentDto } from '@travel/types';
import { AdminPageHeader, StatusPill } from '@/components/admin/ui';
import { AdminResourceTable, type Column } from '@/components/admin/admin-resource-table';
import { formatCurrency } from '@/lib/utils';

export default function AdminPaymentsPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const dateFmt = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', { dateStyle: 'medium' });

  const columns: Column<PaymentDto>[] = [
    { header: t('cols.provider'), cell: (p) => <span className="font-medium">{p.provider}</span> },
    { header: t('cols.status'), cell: (p) => <StatusPill status={p.status} /> },
    {
      header: t('cols.amount'),
      cell: (p) => formatCurrency(p.amount, p.currency, locale),
      className: 'text-end font-medium',
    },
    { header: t('cols.refunds'), cell: (p) => p.refunds.length },
    {
      header: t('cols.date'),
      cell: (p) => <span className="text-muted-foreground">{dateFmt.format(new Date(p.createdAt))}</span>,
    },
  ];

  return (
    <div>
      <AdminPageHeader title={t('nav.payments')} />
      <AdminResourceTable path="/payments/admin/list" columns={columns} emptyLabel={t('empty')} />
    </div>
  );
}
