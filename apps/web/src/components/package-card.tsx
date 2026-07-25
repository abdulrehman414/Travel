import { ArrowRight, Clock, MapPin, Star, Tag } from 'lucide-react';
import type { PackageListItemDto } from '@travel/types';
import { Link } from '@/i18n/navigation';
import { cn, formatCurrency } from '@/lib/utils';

export function PackageCard({ pkg, locale }: { pkg: PackageListItemDto; locale: string }) {
  const isAr = locale === 'ar';
  const title = isAr ? pkg.titleAr : pkg.titleEn;
  const summary = isAr ? pkg.summaryAr : pkg.summaryEn;
  const price = pkg.salePrice ?? pkg.basePrice;
  const destination = pkg.destination ? (isAr ? pkg.destination.nameAr : pkg.destination.nameEn) : null;

  return (
    <Link
      href={`/packages/${pkg.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
    >
      <div className="relative flex h-44 items-end bg-brand-gradient p-4">
        <div className="absolute inset-0 bg-hero-overlay" />
        {destination && (
          <span className="relative inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            <MapPin className="size-3" /> {destination}
          </span>
        )}
        {pkg.salePrice && (
          <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full bg-gold-500 px-2.5 py-1 text-xs font-bold text-ink-900">
            <Tag className="size-3" /> Sale
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> {pkg.durationDays}d / {pkg.durationNights}n
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5 fill-gold-500 text-gold-500" /> {pkg.rating} ({pkg.reviewCount})
          </span>
        </div>
        <h3 className="mt-2 line-clamp-1 text-lg font-semibold">{title}</h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">{summary}</p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(price, pkg.currency, locale)}
            </span>
          </div>
          <ArrowRight
            className={cn(
              'size-5 text-primary transition-transform group-hover:translate-x-1',
              isAr && 'rotate-180 group-hover:-translate-x-1',
            )}
          />
        </div>
      </div>
    </Link>
  );
}
