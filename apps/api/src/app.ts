import path from 'node:path';
import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import { pinoHttp } from 'pino-http';
import { API } from '@travel/config/constants';
import { corsOrigins } from './config/env';
import { logger } from './config/logger';
import { requestContext } from './middleware/request-context';
import { apiRateLimiter } from './middleware/rate-limit';
import { notFound } from './middleware/not-found';
import { errorHandler } from './middleware/error-handler';
import { apiRouter } from './routes';

/** Builds and configures the Express application (no network binding). */
export function createApp(): Express {
  const app = express();

  // Behind Nginx / load balancer in production.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // Tracing + structured request logging.
  app.use(requestContext);
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => (req as unknown as { id: string }).id,
      autoLogging: { ignore: (req) => req.url === `${API.prefix}/health` },
    }),
  );

  // Security headers + CORS.
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(
    cors({
      origin: corsOrigins.length > 0 ? corsOrigins : true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  );

  // Body parsing + hardening. Capture raw bytes for payment webhook signatures.
  app.use(
    express.json({
      limit: '1mb',
      verify: (req, _res, buf) => {
        (req as express.Request).rawBody = buf;
      },
    }),
  );
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());
  app.use(hpp());
  app.use(compression());

  // Static uploads (used by the local storage fallback when Cloudinary is off).
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

  // Routes.
  app.get('/', (_req, res) => {
    res.json({ success: true, data: { name: 'Saudi Luxury Travel API', version: API.version } });
  });
  app.use(API.prefix, apiRateLimiter, apiRouter);

  // 404 + centralized error handling (must be last).
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
