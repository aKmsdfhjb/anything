// TipTrip visual theme, based on the supplied UI reference.
export const colors = {
  tealDark: '#0F766E',
  teal: '#0D9488',
  mint: '#7DE3D0',
  tealGradientStart: '#0F9A9A',
  tealGradientEnd: '#76E0CB',
  ink: '#17191C',
  text: '#262B33',
  muted: '#737B87',
  surface: '#FFFFFF',
  canvas: '#F4F6F8',
  border: '#E7EBEF',
  success: '#15803D',
  accentBlue: '#4B9FE8',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radii = { sm: 10, md: 16, lg: 22, pill: 999 };
export const typography = {
  screenTitle: { fontSize: 28, lineHeight: 34, fontWeight: '800' },
  sectionTitle: { fontSize: 21, lineHeight: 27, fontWeight: '750' },
  cardTitle: { fontSize: 19, lineHeight: 25, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
};

export const shadows = {
  card: {
    shadowColor: '#142D31',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
};

export const categoryColors = {
  food: '#F59E0B',
  hotel: '#8B5CF6',
  excursions: '#0D9488',
  transportation: '#3B82F6',
  nature: '#16A34A',
  shopping: '#EC4899',
  culture: '#D97706',
  nightlife: '#6366F1',
  general: '#0F766E',
};

export default { colors, spacing, radii, typography, shadows, categoryColors };
