import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BedDouble, MapPin, Navigation, Star } from 'lucide-react';
import type { HotelDetailDto } from '@travel/types';
import { Breadcrumbs } from '@/components/layout/page-hero';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { apiFetchSafe } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

function getHotel(slug: string): Promise<HotelDetailDto | null> {
  return apiFetchSafe<HotelDetailDto | null>(`/hotels/${slug}`, null);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const hotel = await getHotel(slug);
  if (!hotel) return {};
  const title = locale === 'ar' ? hotel.nameAr : hotel.nameEn;
  return { title, description: locale === 'ar' ? hotel.descriptionAr : hotel.descriptionEn };
}

export default async function HotelDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const isAr = locale === 'ar';
  const hotel = await getHotel(slug);
  if (!hotel) notFound();

  const t = await getTranslations('hotelDetail');
  const tn = await getTranslations('nav');
  const name = isAr ? hotel.nameAr : hotel.nameEn;

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-brand-gradient">
        <div className="absolute inset-0 bg-hero-overlay opacity-60" />
        <div className="container-px relative mx-auto max-w-[1360px] py-14">
          <Breadcrumbs
            items={[
              { label: tn('home'), href: '/' },
              { label: tn('hotels'), href: '/hotels' },
              { label: name },
            ]}
            light
          />
          <div className="mt-6 flex items-center gap-0.5">
            {Array.from({ length: hotel.starRating }).map((_, i) => (
              <Star key={i} className="size-5 fill-gold-400 text-gold-400" />
            ))}
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">{name}</h1>
          <p className="mt-3 inline-flex items-center gap-1.5 text-white/80">
            <MapPin className="size-4" /> {hotel.address ? `${hotel.address}, ` : ''}
            {hotel.city}, {hotel.country}
          </p>
        </div>
      </section>

      <div className="container-px mx-auto grid max-w-[1360px] gap-10 py-12 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {hotel.descriptionEn && (
            <section>
              <h2 className="text-2xl font-bold">{t('about')}</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {isAr ? hotel.descriptionAr : hotel.descriptionEn}
              </p>
            </section>
          )}

          {hotel.amenities.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold">{t('amenities')}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {hotel.amenities.map((amenity) => (
                  <Badge key={amenity} variant="secondary">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {hotel.rooms.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold">{t('rooms')}</h2>
              <div className="mt-4 space-y-3">
                {hotel.rooms.map((room) => (
                  <Card key={room.id} className="flex items-center justify-between p-5">
                    <div>
                      <h3 className="font-semibold">{isAr ? room.nameAr : room.nameEn}</h3>
                      <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <BedDouble className="size-4" /> {t('sleeps', { count: room.capacity })}
                        {room.boardType ? ` · ${room.boardType}` : ''}
                      </p>
                    </div>
                    <div className="text-end">
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(room.pricePerNight, room.currency, locale)}
                      </span>
                      <span className="block text-xs text-muted-foreground">{t('perNight')}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            {hotel.basePricePerNight != null && (
              <>
                <span className="text-sm text-muted-foreground">{t('from')}</span>
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(hotel.basePricePerNight, hotel.currency, locale)}
                </div>
                <p className="text-sm text-muted-foreground">{t('perNight')}</p>
              </>
            )}
            {hotel.distanceToHaramMeters != null && (
              <p className="mt-5 inline-flex items-center gap-2 text-sm">
                <Navigation className="size-4 text-primary" />
                {t('distanceToHaram', { meters: hotel.distanceToHaramMeters })}
              </p>
            )}
          </Card>
        </aside>
      </div>
    </>
  );
}
