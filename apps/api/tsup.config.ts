import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  target: 'node20',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  // Bundle the workspace TS packages (they ship source, not build output).
  noExternal: ['@travel/db', '@travel/types', '@travel/config'],
  // Keep the Prisma engine external so it loads from node_modules at runtime.
  external: ['@prisma/client', '.prisma/client'],
});
