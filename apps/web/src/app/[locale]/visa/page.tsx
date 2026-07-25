import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Briefcase, FileCheck, Plane, Send, Sparkles, Stamp } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

const TYPES = [
  { key: 'umrah', Icon: Sparkles },
  { key: 'hajj', Icon: Stamp },
  { key: 'tourist', Icon: Plane },
  { key: 'business', Icon: Briefcase },
] as const;

const STEPS = ['step1', 'step2', 'step3', 'step4'] as const;

export default async function VisaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('visaPage');
  const tn = await getTranslations('nav');

  return (
    <>
      <PageHero
        title={t('title')}
        subtitle={t('subtitle')}
        breadcrumbs={[{ label: tn('home'), href: '/' }, { label: t('title') }]}
      />

      <section className="container-px mx-auto max-w-[1360px] py-16">
        <h2 className="text-center font-display text-3xl font-bold">{t('typesTitle')}</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TYPES.map(({ key, Icon }) => (
            <Card key={key} className="p-6">
              <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{t(`${key}.title`)}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{t(`${key}.desc`)}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/30">
        <div className="container-px mx-auto max-w-[1360px] py-16">
          <h2 className="text-center font-display text-3xl font-bold">{t('stepsTitle')}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {STEPS.map((step, index) => (
              <div key={step} className="relative">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-gradient text-lg font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-semibold">{t(`${step}.title`)}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{t(`${step}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-px mx-auto max-w-[1360px] py-16">
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-8 py-14 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_0%,rgba(212,175,55,0.25),transparent)]" />
          <FileCheck className="relative mx-auto size-10 text-gold-300" />
          <h2 className="relative mt-4 font-display text-3xl font-bold text-white">{t('ctaTitle')}</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-white/80">{t('ctaSubtitle')}</p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="gold">
              <Link href="/contact">
                <Send className="size-4" /> {t('ctaButton')}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link href="/login">{t('ctaSecondary')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
