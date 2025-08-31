export const colors = {
  // Primary colors from the gradient palette
  primary: '#7BDFF2', // Light blue from the gradient
  primaryDark: '#B2F7EF', // Mint green from the gradient
  secondary: '#F7D6E0', // Light pink from the gradient
  secondaryDark: '#F2B5D4', // Darker pink from the gradient
  accent: '#EFF7F6', // Very light mint
  
  // Background and surface colors
  background: '#FFFFFF',
  surface: '#F8FFFE',
  surfaceVariant: '#F5F9F8',
  
  // Text colors
  text: '#2D3748',
  mutedText: '#718096',
  textSecondary: '#4A5568',
  textLight: '#A0AEC0',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#2D3748',
  
  // UI colors
  border: '#E2E8F0',
  borderLight: '#F7FAFC',
  overlay: '#2D374880',
  
  // Button colors
  button: '#7BDFF2',
  buttonText: '#FFFFFF',
  buttonSecondary: '#F7D6E0',
  buttonSecondaryBg: '#F7D6E0',
  buttonSecondaryText: '#2D3748',
  buttonSecondaryBorder: '#F2B5D4',
  
  // Status colors
  success: '#48BB78',
  warning: '#ED8936',
  error: '#E53E3E',
  info: '#3182CE',
  
  // Gradient colors for special effects
  gradientStart: '#7BDFF2',
  gradientMiddle: '#B2F7EF',
  gradientEnd: '#F7D6E0',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
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
  shadows: typeof shadows;
};

export const theme: Theme = {
  colors,
  spacing,
  radii,
  typography,
  shadows,
};


