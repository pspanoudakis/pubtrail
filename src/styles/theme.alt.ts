export const COLORS = {
  background: '#eef6ff',
  surface: '#ffffff',
  primary: '#4f46e5',
  secondary: '#06b6d4',
  textPrimary: '#0f172a',
  textSecondary: '#334155',
  border: '#bfdbfe',
  divider: '#bfdbfe',
  mapBackground: '#dbeafe',
  mapText: '#1e3a8a',
  icon: '#312e81',
  shadow: '#1e293b',

  text: '#0b1220',
  primaryDark: '#3730a3',
  primaryLight: '#818cf8',
  primarySubtle: '#e0e7ff',
  backgroundDark: '#020617',
  surfaceDark: '#0b1220',
  surfaceElevatedDark: '#111b2e',
  textDark: '#e2e8f0',
  textSecondaryDark: '#94a3b8',
  borderDark: '#1e293b',

  error: '#dc2626',
  success: '#16a34a',
  warning: '#d97706',
} as const;

export const SPACING = {
  xxs: 3,
  xs: 4,
  _6: 6,
  sm: 8,
  _10: 10,
  _12: 12,
  _14: 14,
  md: 16,
  _20: 20,
  lg: 24,
  xl: 32,
  _38: 38,
  xxl: 48,
  notesMinHeight: 82,
} as const;

export const TYPOGRAPHY = {
  sizes: {
    small: 12,
    label: 14,
    meta: 15,
    body: 16,
    subtitle: 18,
    heading: 20,
    sectionTitle: 22,
    title: 24,
    display: 32,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const RADIUS = {
  sm: 6,
  md: 10,
  field: 14,
  lg: 16,
  pill: 999,
} as const;
