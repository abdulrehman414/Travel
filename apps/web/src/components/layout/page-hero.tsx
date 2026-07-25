import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items, light }: { items: Crumb[]; light?: boolean }) {
  return (
    <nav
      className={cn(
        'flex flex-wrap items-center justify-center gap-1.5 text-sm',
        light ? 'text-white/70' : 'text-muted-foreground',
      )}
    >
      {items.map((crumb, index) => (
        <span key={`${crumb.label}-${index}`} className="inline-flex items-center gap-1.5">
          {index > 0 && <ChevronRight className="size-3.5 rtl:rotate-180" />}
          {crumb.href ? (
            <Link href={crumb.href} className="transition-colors hover:text-foreground hover:underline">
              {crumb.label}
            </Link>
          ) : (
            <span className={light ? 'text-white' : 'text-foreground'}>{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHero({
  title,
  subtitle,
  breadcrumbs,
  children,
}: {
  title: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-brand-gradient">
      <div className="absolute inset-0 bg-[radial-gradient(60%_120%_at_50%_0%,rgba(212,175,55,0.22),transparent)]" />
      <div className="container-px relative mx-auto max-w-[1360px] py-16 text-center">
        {breadcrumbs && (
          <div className="mb-5">
            <Breadcrumbs items={breadcrumbs} light />
          </div>
        )}
        <h1 className="mx-auto max-w-3xl font-display text-4xl font-bold text-white text-balance sm:text-5xl">
          {title}
        </h1>
        {subtitle && <p className="mx-auto mt-4 max-w-2xl text-white/80">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
