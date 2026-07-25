'use client';

import { useTranslations } from 'next-intl';
import type { SettingDto } from '@travel/types';
import { AdminPageHeader } from '@/components/admin/ui';
import { Badge } from '@/components/ui/badge';
import { AdminResourceTable, type Column } from '@/components/admin/admin-resource-table';

export default function AdminSettingsPage() {
  const t = useTranslations('admin');

  const columns: Column<SettingDto>[] = [
    { header: t('cols.key'), cell: (s) => <span className="font-mono text-xs font-medium">{s.key}</span> },
    { header: t('cols.group'), cell: (s) => <Badge variant="secondary">{s.group}</Badge> },
    {
      header: t('cols.value'),
      cell: (s) => (
        <span className="font-mono text-xs text-muted-foreground">{JSON.stringify(s.value)}</span>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader title={t('nav.settings')} />
      <AdminResourceTable path="/settings" columns={columns} emptyLabel={t('empty')} />
    </div>
  );
}
