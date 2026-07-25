import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';
import preset from '@travel/config/tailwind-preset';

const config: Config = {
  presets: [preset],
  content: [
    './src/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  plugins: [animate],
};

export default config;
