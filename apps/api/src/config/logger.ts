import { pino } from 'pino';
import { env, isDev } from './env';

export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: 'saudi-luxury-travel-api' },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.password',
      '*.passwordHash',
      '*.token',
      '*.accessToken',
      '*.refreshToken',
    ],
    censor: '[redacted]',
  },
  ...(isDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname,service',
          },
        },
      }
    : {}),
});

export type AppLogger = typeof logger;
