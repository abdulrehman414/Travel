import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {icon && <span className="text-primary">{icon}</span>}
      </div>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}

export function AdminPageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3 align-middle', className)}>{children}</td>;
}

const STATUS_COLORS: Record<string, string> = {
  PAID: 'bg-success-50 text-success-700',
  CONFIRMED: 'bg-success-50 text-success-700',
  APPROVED: 'bg-success-50 text-success-700',
  PUBLISHED: 'bg-success-50 text-success-700',
  RESOLVED: 'bg-success-50 text-success-700',
  COMPLETED: 'bg-primary/10 text-primary',
  ISSUED: 'bg-primary/10 text-primary',
  PENDING: 'bg-gold-500/15 text-gold-700',
  PROCESSING: 'bg-gold-500/15 text-gold-700',
  PARTIALLY_PAID: 'bg-gold-500/15 text-gold-700',
  SUBMITTED: 'bg-gold-500/15 text-gold-700',
  UNDER_REVIEW: 'bg-gold-500/15 text-gold-700',
  IN_PROGRESS: 'bg-gold-500/15 text-gold-700',
  NEW: 'bg-gold-500/15 text-gold-700',
  DRAFT: 'bg-muted text-muted-foreground',
  ARCHIVED: 'bg-muted text-muted-foreground',
  CANCELLED: 'bg-muted text-muted-foreground',
  REFUNDED: 'bg-muted text-muted-foreground',
  REJECTED: 'bg-danger-500/10 text-danger-600',
  FAILED: 'bg-danger-500/10 text-danger-600',
  SPAM: 'bg-danger-500/10 text-danger-600',
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
        STATUS_COLORS[status] ?? 'bg-secondary text-secondary-foreground',
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
