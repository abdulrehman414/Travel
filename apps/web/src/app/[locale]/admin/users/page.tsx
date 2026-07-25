'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { UserDto } from '@travel/types';
import { AdminPageHeader, StatusPill } from '@/components/admin/ui';
import { Badge } from '@/components/ui/badge';
import { AdminResourceTable, type Column } from '@/components/admin/admin-resource-table';

export default function AdminUsersPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const dateFmt = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', { dateStyle: 'medium' });

  const columns: Column<UserDto>[] = [
    {
      header: t('cols.name'),
      cell: (u) => (
        <div>
          <p className="font-medium">
            {u.firstName} {u.lastName}
          </p>
          <p className="text-xs text-muted-foreground">{u.email}</p>
        </div>
      ),
    },
    {
      header: t('cols.roles'),
      cell: (u) => (
        <div className="flex flex-wrap gap-1">
          {u.roles.map((role) => (
            <Badge key={role} variant="secondary">
              {role}
            </Badge>
          ))}
        </div>
      ),
    },
    { header: t('cols.status'), cell: (u) => <StatusPill status={u.status} /> },
    {
      header: t('cols.date'),
      cell: (u) => <span className="text-muted-foreground">{dateFmt.format(new Date(u.createdAt))}</span>,
    },
  ];

  return (
    <div>
      <AdminPageHeader title={t('nav.users')} />
      <AdminResourceTable path="/users" columns={columns} emptyLabel={t('empty')} />
    </div>
  );
}
