import type { MetadataRoute } from 'next';
import type {
  HotelListItemDto,
  PackageListItemDto,
  Paginated,
  PostListItemDto,
} from '@travel/types';
import { routing } from '@/i18n/routing';
import { apiFetchSafe } from '@/lib/api-client';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const STATIC_PATHS = [
  '',
  '/packages',
  '/hajj',
  '/umrah',
  '/domestic',
  '/international',
  '/hotels',
  '/flights',
  '/visa',
  '/about',
  '/contact',
  '/faq',
  '/blog',
  '/testimonials',
  '/privacy',
  '/terms',
];

function emptyPage<T>(): Paginated<T> {
  return { items: [], meta: { page: 1, limit: 100, total: 0, totalPages: 1, hasNext: false, hasPrev: false } };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [packages, hotels, posts] = await Promise.all([
    apiFetchSafe<Paginated<PackageListItemDto>>('/packages?limit=200', emptyPage()),
    apiFetchSafe<Paginated<HotelListItemDto>>('/hotels?limit=200', emptyPage()),
    apiFetchSafe<Paginated<PostListItemDto>>('/posts?limit=200', emptyPage()),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: `${BASE}/${locale}${path}`,
        changeFrequency: 'weekly',
        priority: path === '' ? 1 : 0.7,
      });
    }
    for (const pkg of packages.items) {
      entries.push({ url: `${BASE}/${locale}/packages/${pkg.slug}`, changeFrequency: 'weekly', priority: 0.8 });
    }
    for (const hotel of hotels.items) {
      entries.push({ url: `${BASE}/${locale}/hotels/${hotel.slug}`, changeFrequency: 'monthly', priority: 0.6 });
    }
    for (const post of posts.items) {
      entries.push({ url: `${BASE}/${locale}/blog/${post.slug}`, changeFrequency: 'monthly', priority: 0.5 });
    }
  }

  return entries;
}
