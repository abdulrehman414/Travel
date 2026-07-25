import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Prisma client singleton. Prevents connection exhaustion during dev hot-reload
 * by caching the instance on `globalThis`.
 */
const globalForPrisma = globalThis as unknown as { __prisma?: PrismaClient };

const createPrismaClient = (): PrismaClient =>
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
  });

export const prisma: PrismaClient = globalForPrisma.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
}

export { Prisma };
export * from '@prisma/client';
export default prisma;
