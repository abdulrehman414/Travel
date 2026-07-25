'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import type { Paginated } from '@travel/types';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Table, Td, Th } from '@/components/admin/ui';

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

export function AdminResourceTable<T extends { id: string }>({
  path,
  columns,
  emptyLabel,
  refreshKey,
}: {
  path: string;
  columns: Column<T>[];
  emptyLabel: string;
  refreshKey?: number;
}) {
  const { authFetch } = useAuth();
  const [rows, setRows] = useState<T[]>([]);
  const [meta, setMeta] = useState<Paginated<T>['meta'] | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const sep = path.includes('?') ? '&' : '?';
    authFetch<Paginated<T>>(`${path}${sep}page=${page}&limit=15`)
      .then((data) => {
        setRows(data.items);
        setMeta(data.meta);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [authFetch, path, page]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  if (loading && rows.length === 0) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card py-16 text-center text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div>
      <Table>
        <thead className="border-b border-border bg-secondary/40">
          <tr>
            {columns.map((column, i) => (
              <Th key={i} className={column.className}>
                {column.header}
              </Th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-secondary/30">
              {columns.map((column, i) => (
                <Td key={i} className={column.className}>
                  {column.cell(row)}
                </Td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
      {meta && meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={!meta.hasPrev}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ‹
          </Button>
          <span className="text-sm text-muted-foreground">
            {meta.page} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!meta.hasNext}
            onClick={() => setPage((p) => p + 1)}
          >
            ›
          </Button>
        </div>
      )}
    </div>
  );
}
