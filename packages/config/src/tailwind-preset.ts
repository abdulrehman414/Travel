import type { Config } from 'tailwindcss';
import { palette, fontFamilies, shadows } from './tokens';

/**
 * Shared Tailwind preset. Consumed by `apps/web/tailwind.config.ts`.
 *
 * Semantic colours (background, primary, ...) resolve to CSS variables that the
 * web app defines for light/dark in globals.css (shadcn/ui convention). The raw
 * brand scales are also exposed as static utilities (e.g. `bg-brand-600`).
 */
const preset: Omit<Config, 'content'> = {
  darkMode: ['class'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
        '2xl': '3rem',
      },
      screens: {
        '2xl': '1360px',
      },
    },
    extend: {
      colors: {
        // shadcn/ui semantic tokens (driven by CSS variables)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Raw brand scales (always available regardless of theme)
        brand: palette.primary,
        gold: palette.gold,
        ink: palette.neutral,
        success: palette.success,
        warning: palette.warning,
        danger: palette.error,
        info: palette.info,
      },
      fontFamily: {
        sans: [...fontFamilies.sans],
        arabic: [...fontFamilies.arabic],
        display: [...fontFamilies.display],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
      },
      boxShadow: {
        soft: shadows.soft,
        card: shadows.card,
        luxury: shadows.luxury,
        gold: shadows.gold,
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(140deg, #123163 0%, #0a1a3f 55%, #0c2445 100%)',
        'gold-gradient': 'linear-gradient(135deg, #E6CA66 0%, #B8942B 100%)',
        'hero-overlay':
          'linear-gradient(180deg, rgba(17,24,39,0.05) 0%, rgba(17,24,39,0.55) 100%)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.4s ease-out both',
        'fade-up': 'fade-up 0.5s ease-out both',
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
};

export default preset;
