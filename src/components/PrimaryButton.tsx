import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { theme } from '../constants/theme';

interface PrimaryButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary';
  labelStyle?: any;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
  label, 
  variant = 'primary', 
  style,
  labelStyle,
  ...props 
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button,
        variant === 'secondary' && styles.secondaryButton,
        style
      ]} 
      {...props}
    >
      <Text style={[
        styles.buttonText,
        variant === 'secondary' && styles.secondaryButtonText,
        props.disabled && styles.disabledText,
        labelStyle
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    ...theme.shadows.md,
  },
  buttonText: {
    color: theme.colors.textOnPrimary,
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.weightSemibold,
  },
  secondaryButton: {
    backgroundColor: theme.colors.buttonSecondary,
    borderWidth: 1,
    borderColor: theme.colors.buttonSecondaryBorder,
  },
  secondaryButtonText: {
    color: theme.colors.buttonSecondaryText,
  },
  disabledText: {
    color: theme.colors.mutedText,
    opacity: 0.6,
  },
});
