// @ts-nocheck
// Vercel serverless entry.
//
// This re-exports the tsup-BUNDLED Express app (`dist/serverless.js`) instead of
// importing the TypeScript source directly. Vercel compiles this entry file with
// per-module native ESM resolution, which cannot resolve the monorepo's
// extensionless relative imports (e.g. `../src/app` -> ERR_MODULE_NOT_FOUND at
// runtime). The bundle collapses the whole app + workspace packages into one
// self-contained file, so there is nothing left to resolve. The bundle is
// produced by the `buildCommand` in vercel.json before this function is built.
import app from '../dist/serverless.js';

export default app;
