/**
 * Application-wide, framework-agnostic constants shared across web and api.
 * Domain enums (roles, booking status, ...) live in `@travel/types`, derived
 * from the Prisma schema. This file holds configuration-level constants only.
 */

export const APP = {
  name: 'Saudi Luxury Travel',
  legalName: 'Saudi Luxury Travel Co.',
  tagline: 'Journeys of a lifetime across the Kingdom and beyond',
  description:
    'Luxury Hajj & Umrah packages, curated Saudi tours, hotels, flights, and visa services for discerning travellers.',
  supportEmail: 'support@saudiluxurytravel.com',
  salesEmail: 'sales@saudiluxurytravel.com',
  phone: '+966 11 000 0000',
  whatsapp: '+966500000000',
  address: {
    line1: 'King Fahd Road',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    postalCode: '11564',
  },
  social: {
    instagram: 'https://instagram.com/saudiluxurytravel',
    twitter: 'https://x.com/saudiluxurytravel',
    facebook: 'https://facebook.com/saudiluxurytravel',
    linkedin: 'https://linkedin.com/company/saudiluxurytravel',
    youtube: 'https://youtube.com/@saudiluxurytravel',
  },
} as const;

export const LOCALES = ['en', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
export const RTL_LOCALES: readonly Locale[] = ['ar'];
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
};

export const CURRENCIES = ['SAR', 'USD', 'EUR', 'GBP', 'AED'] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];
export const DEFAULT_CURRENCY: CurrencyCode = 'SAR';
export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  SAR: 'ر.س',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
};

export const API = {
  version: 'v1',
  prefix: '/api/v1',
  defaultPageSize: 12,
  maxPageSize: 100,
} as const;

export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 12,
  maxLimit: 100,
} as const;

export const UPLOAD = {
  maxImageSizeBytes: 8 * 1024 * 1024, // 8 MB
  maxDocumentSizeBytes: 16 * 1024 * 1024, // 16 MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  allowedDocumentTypes: ['application/pdf', 'image/jpeg', 'image/png'],
} as const;

export const CACHE_TTL = {
  short: 60, // seconds
  medium: 60 * 5,
  long: 60 * 60,
  day: 60 * 60 * 24,
} as const;

export const SEO = {
  titleTemplate: '%s · Saudi Luxury Travel',
  defaultTitle: 'Saudi Luxury Travel — Hajj, Umrah & Luxury Tours',
  twitterHandle: '@saudiluxurytravel',
  ogImage: '/images/og-default.jpg',
} as const;
