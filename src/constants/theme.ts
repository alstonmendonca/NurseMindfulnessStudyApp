export const colors = {
  // New color palette based on user requirements
  primary: '#9c7c5d',      // Tan - for highlights and interactive elements
  secondary: '#bbcacf',    // Light blue - for sound cards
  tertiary: '#2b4961',     // Dark blue - for background
  
  // Background and surface colors
  background: '#2b4961',   // Dark blue background
  surface: '#bbcacf',      // Light blue for cards
  surfaceVariant: '#bbcacf', // Light blue
  
  // Text colors
  text: '#f9f9f9',         // Off-white primary text
  textSecondary: '#f9f9f9', // Off-white secondary text
  textLight: '#f9f9f9',    // Off-white light text
  textOnPrimary: '#2b4961', // Dark blue on tan buttons
  textOnSecondary: '#2b4961', // Dark blue on light blue
  mutedText: '#bbcacf',    // Light blue for muted text
  
  // UI colors
  border: '#bbcacf',       // Light blue borders
  borderLight: '#bbcacf',  // Light blue light borders
  overlay: '#2b4961',      // Dark blue overlay
  
  // Additional properties for backward compatibility
  primaryDark: '#9c7c5d', // Tan
  
  // Button colors
  button: '#9c7c5d',       // Tan buttons
  buttonText: '#f9f9f9',   // Off-white text on buttons
  buttonSecondary: '#bbcacf', // Light blue secondary buttons
  buttonSecondaryText: '#2b4961', // Dark blue text on secondary buttons
  
  // Status colors
  success: '#9c7c5d',      // Tan
  warning: '#bbcacf',      // Light blue
  error: '#9c7c5d',        // Tan
  info: '#bbcacf',         // Light blue
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


