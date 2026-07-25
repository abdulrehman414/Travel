'use client';

import { useTranslations } from 'next-intl';
import { Compass } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <div className="container-px mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center py-20 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="size-8" />
      </span>
      <p className="mt-6 font-display text-6xl font-bold text-primary">404</p>
      <h1 className="mt-2 text-2xl font-bold">{t('title')}</h1>
      <p className="mt-3 text-muted-foreground">{t('message')}</p>
      <Button asChild className="mt-8">
        <Link href="/">{t('home')}</Link>
      </Button>
    </div>
  );
}
