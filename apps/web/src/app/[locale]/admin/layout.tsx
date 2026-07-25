'use client';

import { useEffect, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  CalendarCheck,
  Car,
  CreditCard,
  FileText,
  HelpCircle,
  Hotel,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageSquare,
  Package,
  Plane,
  Settings,
  Stamp,
  Users,
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ADMIN_ROLES = ['super-admin', 'admin', 'editor', 'support'];

const NAV = [
  { href: '/admin', key: 'dashboard', Icon: LayoutDashboard },
  { href: '/admin/bookings', key: 'bookings', Icon: CalendarCheck },
  { href: '/admin/packages', key: 'packages', Icon: Package },
  { href: '/admin/hotels', key: 'hotels', Icon: Hotel },
  { href: '/admin/flights', key: 'flights', Icon: Plane },
  { href: '/admin/transport', key: 'transport', Icon: Car },
  { href: '/admin/visa', key: 'visa', Icon: Stamp },
  { href: '/admin/payments', key: 'payments', Icon: CreditCard },
  { href: '/admin/users', key: 'users', Icon: Users },
  { href: '/admin/posts', key: 'posts', Icon: FileText },
  { href: '/admin/testimonials', key: 'testimonials', Icon: MessageSquare },
  { href: '/admin/faqs', key: 'faqs', Icon: HelpCircle },
  { href: '/admin/settings', key: 'settings', Icon: Settings },
] as const;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const t = useTranslations('admin');
  const { status, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin = !!user && user.roles.some((role) => ADMIN_ROLES.includes(role));

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
    else if (status === 'authenticated' && !isAdmin) router.replace('/');
  }, [status, isAdmin, router]);

  if (status !== 'authenticated' || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-secondary/20">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto border-e border-border bg-card lg:block">
        <div className="flex items-center gap-2 p-5 font-display text-lg font-bold">
          <span className="grid size-8 place-items-center rounded-lg bg-brand-gradient text-white">
            <LayoutDashboard className="size-4" />
          </span>
          {t('title')}
        </div>
        <nav className="space-y-0.5 px-3 pb-6">
          {NAV.map((item) => {
            const active =
              item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary',
                )}
              >
                <item.Icon className="size-4" />
                {t(`nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4 rtl:rotate-180" /> {t('backToSite')}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <span className="hidden text-sm font-medium sm:inline">
              {user.firstName} {user.lastName}
            </span>
            <Button variant="ghost" size="icon" onClick={() => void logout()} aria-label={t('logout')}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
