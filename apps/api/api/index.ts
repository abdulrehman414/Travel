// Vercel serverless entry — exposes the Express app as a single function.
// The Express app is a valid (req, res) handler, so Vercel's Node runtime can
// invoke it directly. IMPORTANT: on serverless you MUST use a POOLED Postgres
// connection (Neon / Supabase pooler / Prisma Accelerate) via DATABASE_URL,
// otherwise concurrent invocations will exhaust the database connection limit.
import { createApp } from '../src/app';

const app = createApp();

export default app;
