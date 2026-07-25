'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqEntry[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 p-5 text-start font-medium transition-colors hover:bg-secondary/50"
              aria-expanded={isOpen}
            >
              {item.question}
              <ChevronDown
                className={cn('size-5 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')}
              />
            </button>
            {isOpen && <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
