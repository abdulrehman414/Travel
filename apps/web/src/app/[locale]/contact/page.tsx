import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { APP } from '@travel/config/constants';
import { PageHero } from '@/components/layout/page-hero';
import { ContactForm } from '@/components/contact-form';

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contactPage');
  const tn = await getTranslations('nav');

  const details = [
    { Icon: Mail, label: t('email'), value: APP.supportEmail, href: `mailto:${APP.supportEmail}` },
    { Icon: Phone, label: t('phone'), value: APP.phone, href: `tel:${APP.phone}` },
    { Icon: MessageCircle, label: t('whatsapp'), value: APP.whatsapp, href: `https://wa.me/${APP.whatsapp.replace(/[^0-9]/g, '')}` },
    { Icon: MapPin, label: t('address'), value: `${APP.address.line1}, ${APP.address.city}, ${APP.address.country}` },
  ];

  return (
    <>
      <PageHero
        title={t('title')}
        subtitle={t('subtitle')}
        breadcrumbs={[{ label: tn('home'), href: '/' }, { label: t('title') }]}
      />
      <section className="container-px mx-auto grid max-w-[1360px] gap-12 py-16 lg:grid-cols-[380px_1fr]">
        <div>
          <h2 className="text-2xl font-bold">{t('infoTitle')}</h2>
          <ul className="mt-6 space-y-5">
            {details.map((d) => (
              <li key={d.label} className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <d.Icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm text-muted-foreground">{d.label}</p>
                  {d.href ? (
                    <a href={d.href} className="font-medium hover:text-primary">
                      {d.value}
                    </a>
                  ) : (
                    <p className="font-medium">{d.value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
