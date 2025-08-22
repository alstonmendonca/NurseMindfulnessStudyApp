import React from 'react';
import { SafeAreaView, View, StyleSheet, Text, ViewStyle } from 'react-native';
import { theme } from '../constants/theme';

interface ScreenProps {
  title?: string;
  subtitle?: string;
  style?: ViewStyle;
  children: React.ReactNode;
}

export const Screen: React.FC<ScreenProps> = ({ title, subtitle, style, children }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, style]}>
        {(title || subtitle) && (
          <View style={styles.header}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        )}
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.title,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.subtitle,
    color: theme.colors.mutedText,
    fontFamily: theme.typography.fontFamily.regular,
  },
});


