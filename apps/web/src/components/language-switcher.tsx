'use client';

import { useLocale } from 'next-intl';
import { Languages } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const next = locale === 'en' ? 'ar' : 'en';

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1.5"
      onClick={() => router.replace(pathname, { locale: next })}
      aria-label="Switch language"
    >
      <Languages className="size-4" />
      {locale === 'en' ? 'العربية' : 'English'}
    </Button>
  );
}
