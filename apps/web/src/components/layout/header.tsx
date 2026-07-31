'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, LogOut, Menu, Plane, X } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { isImmersiveRoute } from '@/lib/immersive-routes';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useAuth } from '@/components/auth/auth-provider';

const NAV = [
  { key: 'umrah', href: '/umrah' },
  { key: 'hajj', href: '/hajj' },
  { key: 'packages', href: '/packages' },
  { key: 'hotels', href: '/hotels' },
  { key: 'flights', href: '/flights' },
  { key: 'transportation', href: '/transportation' },
  { key: 'visa', href: '/visa' },
  { key: 'blog', href: '/blog' },
  { key: 'contact', href: '/contact' },
] as const;

export function Header() {
  const t = useTranslations('nav');
  const tb = useTranslations('brand');
  const { status, user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (pathname.startsWith('/admin')) return null;

  // On immersive routes the bar is dark-scoped to match the cinematic pages; on the
  // home hero it starts transparent and solidifies on scroll.
  const immersive = isImmersiveRoute(pathname);
  const transparent = pathname === '/' && !scrolled && !open;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        immersive && 'dark',
        transparent
          ? 'border-b border-transparent bg-transparent'
          : 'border-b border-border/60 bg-background/80 backdrop-blur-md',
      )}
    >
      <div className="container-px mx-auto flex h-16 max-w-[1360px] items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-gradient text-white">
            <Plane className="size-5" />
          </span>
          <span className="hidden sm:inline">{tb('name')}</span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
          {status === 'authenticated' ? (
            <>
              <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
                <Link href="/dashboard">
                  <LayoutDashboard className="size-4" /> {user?.firstName ?? t('account')}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => void logout()}
                aria-label={t('logout')}
                className="hidden sm:inline-flex"
              >
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/login">{t('signIn')}</Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="container-px mx-auto grid max-w-[1360px] gap-1 py-3">
            {NAV.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-secondary"
              >
                {t(item.key)}
              </Link>
            ))}
            {status === 'authenticated' ? (
              <>
                <Button asChild className="mt-2" variant="outline">
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    {t('account')}
                  </Link>
                </Button>
                <Button
                  className="mt-1"
                  variant="ghost"
                  onClick={() => {
                    setOpen(false);
                    void logout();
                  }}
                >
                  {t('logout')}
                </Button>
              </>
            ) : (
              <Button asChild className="mt-2">
                <Link href="/login" onClick={() => setOpen(false)}>
                  {t('signIn')}
                </Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
