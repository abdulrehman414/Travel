import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { APP } from '@travel/config/constants';
import { routing, isRtl } from '@/i18n/routing';
import { inter, tajawal } from '@/lib/fonts';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ImmersiveBackground } from '@/components/immersive/immersive-background';
import { JsonLd } from '@/components/json-ld';
import { cn } from '@/lib/utils';
import '../globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'brand' });
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title: { default: `${t('name')} — ${t('tagline')}`, template: `%s · ${t('name')}` },
    description: t('tagline'),
    openGraph: { title: t('name'), description: t('tagline'), type: 'website' },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as never)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={isRtl(locale) ? 'rtl' : 'ltr'}
      suppressHydrationWarning
      className={cn(inter.variable, tajawal.variable)}
    >
      <body className="min-h-dvh bg-[#060a18] font-sans text-foreground antialiased">
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'TravelAgency',
            name: APP.name,
            description: APP.description,
            url: SITE_URL,
            email: APP.supportEmail,
            telephone: APP.phone,
            address: {
              '@type': 'PostalAddress',
              streetAddress: APP.address.line1,
              addressLocality: APP.address.city,
              addressCountry: APP.address.country,
              postalCode: APP.address.postalCode,
            },
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <ImmersiveBackground />
            <div className="relative z-10 flex min-h-dvh flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
