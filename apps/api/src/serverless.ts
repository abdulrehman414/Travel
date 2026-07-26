import { createApp } from './app';

/**
 * Serverless entry point. Exports the fully-configured Express app (with no
 * network binding) so a Function runtime can invoke it directly as a
 * (req, res) handler. This module is bundled by tsup into `dist/serverless.js`
 * — a single self-contained file — so the deployed function never has to
 * resolve the monorepo's extensionless TypeScript imports at runtime.
 */
const app = createApp();

export default app;
