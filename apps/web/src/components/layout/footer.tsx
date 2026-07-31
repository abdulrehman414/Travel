'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Plane } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { isImmersiveRoute } from '@/lib/immersive-routes';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api-client';

const COLUMNS = {
  company: [
    { key: 'about', href: '/about' },
    { key: 'blog', href: '/blog' },
    { key: 'contact', href: '/contact' },
  ],
  services: [
    { key: 'hajj', href: '/hajj' },
    { key: 'umrah', href: '/umrah' },
    { key: 'hotels', href: '/hotels' },
    { key: 'visa', href: '/visa' },
  ],
} as const;

function NewsletterForm() {
  const t = useTranslations('footer');
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setState('loading');
    try {
      await apiFetch('/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setState('done');
      setEmail('');
    } catch {
      setState('error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('newsletterPlaceholder')}
        className="h-11 flex-1 rounded-lg border border-input bg-background px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Button type="submit" variant="gold" disabled={state === 'loading'}>
        {state === 'done' ? '✓' : t('subscribe')}
      </Button>
    </form>
  );
}

export function Footer() {
  const t = useTranslations('footer');
  const tn = useTranslations('nav');
  const tb = useTranslations('brand');
  const pathname = usePathname();
  const year = 2026;

  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className={cn('border-t border-border bg-secondary/30', isImmersiveRoute(pathname) && 'dark')}>
      <div className="container-px mx-auto max-w-[1360px] py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
              <span className="grid size-9 place-items-center rounded-xl bg-brand-gradient text-white">
                <Plane className="size-5" />
              </span>
              {tb('name')}
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">{t('tagline')}</p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">{t('company')}</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {COLUMNS.company.map((l) => (
                <li key={l.key}>
                  <Link href={l.href} className="hover:text-foreground">
                    {tn(l.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">{t('services')}</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {COLUMNS.services.map((l) => (
                <li key={l.key}>
                  <Link href={l.href} className="hover:text-foreground">
                    {tn(l.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">{t('newsletter')}</h3>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {year} {tb('name')}. {t('rights')}
        </div>
      </div>
    </footer>
  );
}
