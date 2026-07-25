import type { ReactNode } from 'react';
import { Plane } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="container-px mx-auto flex min-h-[80vh] max-w-md flex-col justify-center py-16">
      <Link href="/" className="mb-8 flex items-center justify-center gap-2">
        <span className="grid size-11 place-items-center rounded-xl bg-brand-gradient text-white">
          <Plane className="size-6" />
        </span>
      </Link>
      <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
        <h1 className="text-center font-display text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-2 text-center text-sm text-muted-foreground">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
