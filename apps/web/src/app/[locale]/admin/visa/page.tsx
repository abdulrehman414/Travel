'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { VisaRequestDto } from '@travel/types';
import { AdminPageHeader, StatusPill } from '@/components/admin/ui';
import { AdminResourceTable, type Column } from '@/components/admin/admin-resource-table';

export default function AdminVisaPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const dateFmt = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', { dateStyle: 'medium' });

  const columns: Column<VisaRequestDto>[] = [
    { header: t('cols.reference'), cell: (v) => <span className="font-medium">{v.reference}</span> },
    {
      header: t('cols.applicant'),
      cell: (v) => `${v.applicantFirstName} ${v.applicantLastName}`,
    },
    { header: t('cols.type'), cell: (v) => v.type },
    { header: t('cols.nationality'), cell: (v) => v.nationality },
    { header: t('cols.status'), cell: (v) => <StatusPill status={v.status} /> },
    {
      header: t('cols.date'),
      cell: (v) => <span className="text-muted-foreground">{dateFmt.format(new Date(v.createdAt))}</span>,
    },
  ];

  return (
    <div>
      <AdminPageHeader title={t('nav.visa')} />
      <AdminResourceTable path="/visa/admin/list" columns={columns} emptyLabel={t('empty')} />
    </div>
  );
}
