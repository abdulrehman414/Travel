import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Clock, User } from 'lucide-react';
import type { PostDetailDto } from '@travel/types';
import { Breadcrumbs } from '@/components/layout/page-hero';
import { apiFetchSafe } from '@/lib/api-client';

function getPost(slug: string): Promise<PostDetailDto | null> {
  return apiFetchSafe<PostDetailDto | null>(`/posts/${slug}`, null);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  const title = locale === 'ar' ? post.titleAr : post.titleEn;
  return { title, description: locale === 'ar' ? post.excerptAr : post.excerptEn };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const isAr = locale === 'ar';
  const post = await getPost(slug);
  if (!post) notFound();

  const t = await getTranslations('blog');
  const tn = await getTranslations('nav');
  const dateFmt = new Intl.DateTimeFormat(isAr ? 'ar-SA' : 'en-US', { dateStyle: 'long' });

  return (
    <article>
      <section className="relative overflow-hidden border-b border-border bg-brand-gradient">
        <div className="absolute inset-0 bg-hero-overlay opacity-60" />
        <div className="container-px relative mx-auto max-w-3xl py-14">
          <Breadcrumbs
            items={[
              { label: tn('home'), href: '/' },
              { label: tn('blog'), href: '/blog' },
            ]}
            light
          />
          <h1 className="mt-6 font-display text-4xl font-bold text-white text-balance sm:text-5xl">
            {isAr ? post.titleAr : post.titleEn}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/80">
            {post.author && (
              <span className="inline-flex items-center gap-1.5">
                <User className="size-4" /> {post.author.firstName} {post.author.lastName}
              </span>
            )}
            {post.publishedAt && <span>{dateFmt.format(new Date(post.publishedAt))}</span>}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" /> {post.readMinutes} {t('readMin')}
            </span>
          </div>
        </div>
      </section>

      <div className="container-px mx-auto max-w-3xl py-12">
        <div className="whitespace-pre-line text-lg leading-relaxed text-foreground/90">
          {isAr ? post.contentAr : post.contentEn}
        </div>
      </div>
    </article>
  );
}
