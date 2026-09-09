export const COLORS = {
  // Legacy `colors` palette preserved as the main token set.
  background: '#f6f1e8',
  surface: '#fff9ef',
  primary: '#8b5e3c',
  secondary: '#c0925a',
  textPrimary: '#2b2118',
  textSecondary: '#6b5a4b',
  border: '#d8c6b2',
  divider: '#d8c6b2',
  mapBackground: '#efe3d2',
  mapText: '#6b5a4b',
  icon: '#6b3f26',
  shadow: '#2b2118',

  // Additional tokens used in native views.
  text: '#12100A',
  primaryDark: '#8b6520',
  primaryLight: '#E5B84D',
  primarySubtle: '#FBF3DF',
  backgroundDark: '#0A0907',
  surfaceDark: '#141210',
  surfaceElevatedDark: '#1E1C18',
  textDark: '#F5EED8',
  textSecondaryDark: '#8C8070',
  borderDark: '#2C2820',

  // Semantic
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
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
