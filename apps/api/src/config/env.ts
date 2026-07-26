import { config as loadEnv } from 'dotenv';
import path from 'node:path';
import { z } from 'zod';

// Load the monorepo-root .env (dev). In containers real env vars are already
// present and take precedence — dotenv never overrides an existing variable.
loadEnv({ path: path.resolve(process.cwd(), '../../.env') });
loadEnv();

/** Robust string→boolean coercion (z.coerce.boolean treats "false" as true). */
const stringBool = (def: boolean) =>
  z
    .preprocess((value) => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') return ['true', '1', 'yes'].includes(value.toLowerCase());
      return def;
    }, z.boolean())
    .default(def);

const optionalString = z.string().optional().default('');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Server
  API_PORT: z.coerce.number().int().positive().default(4000),
  API_HOST: z.string().default('0.0.0.0'),
  API_PUBLIC_URL: z.string().default('http://localhost:4000'),
  WEB_APP_URL: z.string().default('http://localhost:3000'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Auth
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 chars'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  COOKIE_DOMAIN: z.string().default('localhost'),
  COOKIE_SECURE: stringBool(false),
  PASSWORD_SALT_ROUNDS: z.coerce.number().int().min(8).max(15).default(12),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),

  // Logging
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),

  // Mail (SMTP / Mailhog in dev)
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().int().default(1025),
  SMTP_SECURE: stringBool(false),
  SMTP_USER: optionalString,
  SMTP_PASSWORD: optionalString,
  MAIL_FROM_NAME: z.string().default('Saudi Luxury Travel'),
  MAIL_FROM_ADDRESS: z.string().default('no-reply@saudiluxurytravel.com'),
  // Resend (https://resend.com) transactional email — preferred on serverless
  // (HTTP API, no SMTP ports). When set, it takes precedence over SMTP.
  RESEND_API_KEY: optionalString,

  // Integrations — all optional; absence triggers a local mock adapter.
  CLOUDINARY_CLOUD_NAME: optionalString,
  CLOUDINARY_API_KEY: optionalString,
  CLOUDINARY_API_SECRET: optionalString,
  CLOUDINARY_UPLOAD_FOLDER: z.string().default('saudi-luxury-travel'),

  STRIPE_SECRET_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString,
  STRIPE_CURRENCY: z.string().default('sar'),

  HYPERPAY_ENTITY_ID: optionalString,
  HYPERPAY_ACCESS_TOKEN: optionalString,
  HYPERPAY_BASE_URL: z.string().default('https://eu-test.oppwa.com'),

  PAYTABS_PROFILE_ID: optionalString,
  PAYTABS_SERVER_KEY: optionalString,
  PAYTABS_BASE_URL: z.string().default('https://secure.paytabs.sa'),

  HOTELBEDS_API_KEY: optionalString,
  HOTELBEDS_SECRET: optionalString,
  HOTELBEDS_BASE_URL: z.string().default('https://api.test.hotelbeds.com'),

  AMADEUS_CLIENT_ID: optionalString,
  AMADEUS_CLIENT_SECRET: optionalString,
  AMADEUS_BASE_URL: z.string().default('https://test.api.amadeus.com'),

  GOOGLE_MAPS_SERVER_KEY: optionalString,

  WHATSAPP_PHONE_NUMBER_ID: optionalString,
  WHATSAPP_ACCESS_TOKEN: optionalString,
  WHATSAPP_API_VERSION: z.string().default('v21.0'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.flatten().fieldErrors;
  console.error('❌ Invalid environment configuration:\n', JSON.stringify(issues, null, 2));
  throw new Error('Invalid environment configuration — see errors above.');
}

export const env = parsed.data;

export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

export const corsOrigins = env.CORS_ORIGINS.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export type Env = typeof env;
