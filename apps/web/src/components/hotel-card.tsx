import { MapPin, Star } from 'lucide-react';
import type { HotelListItemDto } from '@travel/types';
import { Link } from '@/i18n/navigation';
import { formatCurrency } from '@/lib/utils';

export function HotelCard({
  hotel,
  locale,
  perNightLabel,
}: {
  hotel: HotelListItemDto;
  locale: string;
  perNightLabel: string;
}) {
  const isAr = locale === 'ar';
  const name = isAr ? hotel.nameAr : hotel.nameEn;

  return (
    <Link
      href={`/hotels/${hotel.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
    >
      <div className="relative flex h-40 items-end bg-brand-gradient p-4">
        <div className="absolute inset-0 bg-hero-overlay" />
        <span className="relative inline-flex items-center gap-0.5">
          {Array.from({ length: hotel.starRating }).map((_, i) => (
            <Star key={i} className="size-3.5 fill-gold-400 text-gold-400" />
          ))}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-1 text-lg font-semibold">{name}</h3>
        <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5" /> {hotel.city}, {hotel.country}
        </p>
        {hotel.amenities.length > 0 && (
          <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
            {hotel.amenities.slice(0, 3).join(' · ')}
          </p>
        )}
        {hotel.basePricePerNight != null && (
          <p className="mt-3 text-primary">
            <span className="text-lg font-bold">
              {formatCurrency(hotel.basePricePerNight, hotel.currency, locale)}
            </span>{' '}
            <span className="text-xs text-muted-foreground">{perNightLabel}</span>
          </p>
        )}
      </div>
    </Link>
  );
}
