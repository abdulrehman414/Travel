'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  CalendarCheck,
  CircleDollarSign,
  Hotel,
  Loader2,
  Mail,
  Package,
  Stamp,
  Users,
} from 'lucide-react';
import type { DashboardStatsDto } from '@travel/types';
import { useAuth } from '@/components/auth/auth-provider';
import { AdminPageHeader, StatCard, StatusPill, Table, Td, Th } from '@/components/admin/ui';
import { formatCurrency } from '@/lib/utils';

export default function AdminDashboard() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const { status, authFetch } = useAuth();
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated') return;
    authFetch<DashboardStatsDto>('/analytics/dashboard')
      .then(setStats)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [status, authFetch]);

  const dateFmt = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    dateStyle: 'medium',
  });

  if (loading || !stats) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const cards = [
    { label: t('stats.revenue'), value: formatCurrency(stats.revenue.total, stats.revenue.currency, locale), Icon: CircleDollarSign },
    { label: t('stats.bookings'), value: stats.bookings.total, Icon: CalendarCheck },
    { label: t('stats.users'), value: stats.users.total, Icon: Users },
    { label: t('stats.packages'), value: stats.packages.published, Icon: Package },
    { label: t('stats.hotels'), value: stats.hotels.total, Icon: Hotel },
    { label: t('stats.visaPending'), value: stats.visa.pending, Icon: Stamp },
    { label: t('stats.contactUnread'), value: stats.contact.unread, Icon: Mail },
  ];

  return (
    <div>
      <AdminPageHeader title={t('nav.dashboard')} subtitle={t('dashboardSubtitle')} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <StatCard key={c.label} label={c.label} value={c.value} icon={<c.Icon className="size-5" />} />
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-lg font-bold">{t('recentBookings')}</h2>
      {stats.recentBookings.length === 0 ? (
        <p className="text-muted-foreground">—</p>
      ) : (
        <Table>
          <thead className="border-b border-border bg-secondary/40">
            <tr>
              <Th>{t('cols.reference')}</Th>
              <Th>{t('cols.status')}</Th>
              <Th className="text-end">{t('cols.total')}</Th>
              <Th>{t('cols.date')}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {stats.recentBookings.map((b) => (
              <tr key={b.id}>
                <Td className="font-medium">{b.reference}</Td>
                <Td>
                  <StatusPill status={b.status} />
                </Td>
                <Td className="text-end">
                  {formatCurrency(b.grandTotal, stats.revenue.currency, locale)}
                </Td>
                <Td className="text-muted-foreground">{dateFmt.format(new Date(b.createdAt))}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
