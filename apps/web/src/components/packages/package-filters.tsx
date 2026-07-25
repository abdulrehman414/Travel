'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const TYPES = [
  { value: '', key: 'all' },
  { value: 'UMRAH', key: 'umrah' },
  { value: 'HAJJ', key: 'hajj' },
  { value: 'DOMESTIC_TOUR', key: 'domestic' },
  { value: 'INTERNATIONAL_TOUR', key: 'international' },
] as const;

export function PackageFilters({ activeType, search }: { activeType: string; search: string }) {
  const t = useTranslations('packages');
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(search);

  function go(type: string, searchValue: string) {
    const sp = new URLSearchParams();
    if (type) sp.set('type', type);
    if (searchValue) sp.set('search', searchValue);
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-2">
        {TYPES.map((type) => (
          <button
            key={type.key}
            type="button"
            onClick={() => go(type.value, q)}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              activeType === type.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card hover:bg-secondary',
            )}
          >
            {t(type.key)}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          go(activeType, q);
        }}
        className="flex w-full gap-2 md:w-80"
      >
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('searchPlaceholder')} />
        <Button type="submit" size="icon" aria-label="Search">
          <Search />
        </Button>
      </form>
    </div>
  );
}
