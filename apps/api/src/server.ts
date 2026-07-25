import { env } from './config/env';
import { logger } from './config/logger';
import { createApp } from './app';
import { prisma } from '@travel/db';
import { API } from '@travel/config/constants';

function bootstrap(): void {
  const app = createApp();

  const server = app.listen(env.API_PORT, env.API_HOST, () => {
    logger.info(
      `🚀 API listening on http://${env.API_HOST}:${env.API_PORT}${API.prefix}`,
    );
  });

  const shutdown = (signal: string): void => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(() => {
      void prisma.$disconnect().finally(() => process.exit(0));
    });
    // Force-exit if graceful shutdown stalls.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled promise rejection');
  });
  process.on('uncaughtException', (error) => {
    logger.fatal({ error }, 'Uncaught exception — exiting');
    process.exit(1);
  });
}

bootstrap();
