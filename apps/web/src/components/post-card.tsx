import { Clock } from 'lucide-react';
import type { PostListItemDto } from '@travel/types';
import { Link } from '@/i18n/navigation';

export function PostCard({
  post,
  locale,
  readLabel,
}: {
  post: PostListItemDto;
  locale: string;
  readLabel: string;
}) {
  const isAr = locale === 'ar';
  const dateFmt = new Intl.DateTimeFormat(isAr ? 'ar-SA' : 'en-US', { dateStyle: 'medium' });

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
    >
      <div className="relative h-44 bg-brand-gradient">
        <div className="absolute inset-0 bg-hero-overlay" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {post.publishedAt && <span>{dateFmt.format(new Date(post.publishedAt))}</span>}
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> {post.readMinutes} {readLabel}
          </span>
        </div>
        <h3 className="mt-2 line-clamp-2 text-lg font-semibold">
          {isAr ? post.titleAr : post.titleEn}
        </h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {isAr ? post.excerptAr : post.excerptEn}
        </p>
      </div>
    </Link>
  );
}
