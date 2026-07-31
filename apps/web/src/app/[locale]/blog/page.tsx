import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Paginated, PostListItemDto } from '@travel/types';
import { PageHero } from '@/components/layout/page-hero';
import { PostCard } from '@/components/post-card';
import { ImmersiveShell } from '@/components/immersive/immersive-shell';
import { apiFetchSafe } from '@/lib/api-client';

const EMPTY: Paginated<PostListItemDto> = {
  items: [],
  meta: { page: 1, limit: 12, total: 0, totalPages: 1, hasNext: false, hasPrev: false },
};

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('blog');
  const tn = await getTranslations('nav');
  const data = await apiFetchSafe<Paginated<PostListItemDto>>('/posts?limit=12', EMPTY);

  return (
    <ImmersiveShell>
      <PageHero
        immersive
        title={t('title')}
        subtitle={t('subtitle')}
        breadcrumbs={[{ label: tn('home'), href: '/' }, { label: t('title') }]}
      />
      <section className="container-px mx-auto max-w-[1360px] py-16">
        {data.items.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">{t('empty')}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((post) => (
              <PostCard key={post.id} post={post} locale={locale} readLabel={t('readMin')} />
            ))}
          </div>
        )}
      </section>
    </ImmersiveShell>
  );
}
