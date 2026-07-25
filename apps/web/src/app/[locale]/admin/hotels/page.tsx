'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Star } from 'lucide-react';
import type { HotelListItemDto } from '@travel/types';
import { AdminPageHeader } from '@/components/admin/ui';
import { Badge } from '@/components/ui/badge';
import { AdminResourceTable, type Column } from '@/components/admin/admin-resource-table';
import { formatCurrency } from '@/lib/utils';

export default function AdminHotelsPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const columns: Column<HotelListItemDto>[] = [
    {
      header: t('cols.name'),
      cell: (h) => <span className="font-medium">{isAr ? h.nameAr : h.nameEn}</span>,
    },
    { header: t('cols.city'), cell: (h) => `${h.city}, ${h.country}` },
    {
      header: t('cols.stars'),
      cell: (h) => (
        <span className="inline-flex items-center gap-0.5">
          {Array.from({ length: h.starRating }).map((_, i) => (
            <Star key={i} className="size-3.5 fill-gold-500 text-gold-500" />
          ))}
        </span>
      ),
    },
    {
      header: t('cols.price'),
      cell: (h) => (h.basePricePerNight != null ? formatCurrency(h.basePricePerNight, h.currency, locale) : '—'),
      className: 'text-end',
    },
    { header: t('cols.featured'), cell: (h) => (h.featured ? <Badge variant="gold">★</Badge> : '—') },
  ];

  return (
    <div>
      <AdminPageHeader title={t('nav.hotels')} />
      <AdminResourceTable path="/hotels/admin/list" columns={columns} emptyLabel={t('empty')} />
    </div>
  );
}
