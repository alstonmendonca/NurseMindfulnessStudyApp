export const colors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#000000',
  mutedText: '#6B7280',
  border: '#E5E7EB',
  overlay: '#111111',
  button: '#000000',
  buttonText: '#FFFFFF',
  buttonSecondaryBg: '#FFFFFF',
  buttonSecondaryText: '#000000',
  buttonSecondaryBorder: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
};

export const typography = {
  title: 28,
  subtitle: 18,
  body: 16,
  small: 12,
  fontFamily: {
    regular: 'Roboto-Regular',
    medium: 'Roboto-Medium',
    bold: 'Roboto-Bold',
    light: 'Roboto-Light',
    thin: 'Roboto-Thin',
  },
  weightRegular: '400' as const,
  weightMedium: '500' as const,
  weightSemibold: '600' as const,
  weightBold: '700' as const,
};

export type Theme = {
  colors: typeof colors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
};

export const theme: Theme = {
  colors,
  spacing,
  radii,
  typography,
};


