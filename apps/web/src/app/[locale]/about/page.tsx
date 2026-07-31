import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Award, Globe2, HeartHandshake, ShieldCheck } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { Card } from '@/components/ui/card';
import { ImmersiveShell } from '@/components/immersive/immersive-shell';

const VALUES = [
  { key: 'excellence', Icon: Award },
  { key: 'trust', Icon: ShieldCheck },
  { key: 'care', Icon: HeartHandshake },
  { key: 'reach', Icon: Globe2 },
] as const;

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');
  const tn = await getTranslations('nav');

  return (
    <ImmersiveShell>
      <PageHero
        immersive
        title={t('title')}
        subtitle={t('subtitle')}
        breadcrumbs={[{ label: tn('home'), href: '/' }, { label: t('title') }]}
      />

      <section className="container-px mx-auto max-w-3xl py-16 text-center">
        <h2 className="font-display text-3xl font-bold">{t('missionTitle')}</h2>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{t('missionBody')}</p>
      </section>

      <section className="border-y border-border bg-secondary/30">
        <div className="container-px mx-auto grid max-w-[1360px] grid-cols-3 gap-6 py-14 text-center">
          {[
            { v: '12+', k: t('statsYears') },
            { v: '25k+', k: t('statsTravellers') },
            { v: '40+', k: t('statsDestinations') },
          ].map((s) => (
            <div key={s.k}>
              <p className="font-display text-4xl font-bold text-primary">{s.v}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.k}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-px mx-auto max-w-[1360px] py-16">
        <h2 className="text-center font-display text-3xl font-bold">{t('valuesTitle')}</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ key, Icon }) => (
            <Card key={key} className="p-6 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-gold-gradient text-ink-900">
                <Icon className="size-7" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{t(`${key}.title`)}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{t(`${key}.desc`)}</p>
            </Card>
          ))}
        </div>
      </section>
    </ImmersiveShell>
  );
}
