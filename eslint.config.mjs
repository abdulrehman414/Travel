import base from '@travel/config/eslint';

/**
 * Root ESLint flat config. Packages inherit this by walking up the tree; apps
 * that need framework-specific rules (e.g. apps/web with Next.js) provide their
 * own eslint.config.mjs that composes this shared base.
 */
export default [...base];
