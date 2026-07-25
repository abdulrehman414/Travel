/**
 * Design tokens — single source of truth for the Saudi Luxury Travel brand.
 *
 * Brand anchors:
 *   - Primary  #006C35 (Saudi green)
 *   - Accent   #D4AF37 (gold)
 *   - Surface  #F8FAFC
 *   - Ink      #111827
 *
 * The scales below are consumed by the Tailwind preset (static utility colours)
 * and mirrored as CSS variables in the web app's globals.css for shadcn/ui.
 */

export const palette = {
  /** Saudi green — primary brand colour (#006C35 at 600). */
  primary: {
    50: '#E6F2EC',
    100: '#C2DFCE',
    200: '#9BCBAF',
    300: '#6FB68E',
    400: '#43A16E',
    500: '#1A8A50',
    600: '#006C35',
    700: '#005A2C',
    800: '#004522',
    900: '#003018',
    950: '#001C0E',
  },
  /** Gold — accent colour (#D4AF37 at 500). */
  gold: {
    50: '#FBF6E7',
    100: '#F5E9BF',
    200: '#EEDA93',
    300: '#E6CA66',
    400: '#DFBD46',
    500: '#D4AF37',
    600: '#B8942B',
    700: '#937420',
    800: '#6E5718',
    900: '#4A3B10',
    950: '#2A2109',
  },
  /** Neutral slate — surfaces & text (#F8FAFC at 50, #111827 at 900). */
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#111827',
    950: '#020617',
  },
  success: {
    50: '#ECFDF5',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  },
  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },
  error: {
    50: '#FEF2F2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
  info: {
    50: '#EFF6FF',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
  },
} as const;

export const brand = {
  primary: palette.primary[600],
  accent: palette.gold[500],
  background: palette.neutral[50],
  foreground: palette.neutral[900],
} as const;

export const fontFamilies = {
  sans: ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
  arabic: ['var(--font-tajawal)', 'Tajawal', 'system-ui', 'sans-serif'],
  display: ['var(--font-inter)', 'Inter', 'Georgia', 'serif'],
} as const;

export const radius = {
  sm: '0.375rem',
  DEFAULT: '0.625rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.25rem',
  '2xl': '1.75rem',
  full: '9999px',
} as const;

export const shadows = {
  soft: '0 1px 2px 0 rgb(17 24 39 / 0.04), 0 1px 3px 0 rgb(17 24 39 / 0.06)',
  card: '0 4px 24px -8px rgb(17 24 39 / 0.12)',
  luxury: '0 20px 60px -20px rgb(0 108 53 / 0.25)',
  gold: '0 12px 32px -12px rgb(212 175 55 / 0.4)',
  focus: '0 0 0 3px rgb(0 108 53 / 0.35)',
} as const;

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  toast: 1500,
  tooltip: 1600,
} as const;

export type Palette = typeof palette;
export type PaletteKey = keyof Palette;
