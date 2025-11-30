export const colors = {
  // New color palette
  primary: '#3A2477',      // Mindfulness purple - for highlights
  secondary: '#101340',    // Secondary background
  tertiary: '#050726',     // Main background
  
  // Background and surface colors
  background: '#050726',   // Main background
  surface: '#101340',      // Secondary background for cards
  surfaceVariant: '#101340', // Secondary background variant
  
  // Text colors
  text: '#E5E7EC',         // Primary text and icons
  textSecondary: '#E5E7EC', // Secondary text
  textLight: '#E5E7EC',    // Light text
  textOnPrimary: '#E5E7EC', // Text on colored buttons
  textOnSecondary: '#E5E7EC', // Text on secondary backgrounds
  mutedText: '#9ca3af',    // Muted text
  
  // UI colors
  border: '#101340',       // Borders
  borderLight: '#101340',  // Light borders
  overlay: '#050726',      // Overlay
  
  // Additional properties for backward compatibility
  primaryDark: '#3A2477', // Mindfulness purple
  
  // Button colors
  button: '#3A2477',       // Primary buttons
  buttonText: '#E5E7EC',   // Text on buttons
  buttonSecondary: '#101340', // Secondary buttons
  buttonSecondaryText: '#E5E7EC', // Text on secondary buttons
  
  // Homepage card colors
  meditate: '#C36B32',     // Meditate button
  mindfulness: '#3A2477',  // Mindfulness button
  move: '#C25A99',         // Move button
  breathing: '#1960CC',    // Breathing button
  
  // Status colors
  success: '#10b981',      // Green
  warning: '#f59e0b',      // Orange
  error: '#ef4444',        // Red
  info: '#3b82f6',         // Blue
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


