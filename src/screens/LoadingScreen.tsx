import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export const LoadingScreen = () => {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      paddingHorizontal: 20,
    }}>
      {/* App icon placeholder */}
      <View style={{
        marginBottom: 30,
        alignItems: 'center',
      }}>
        <Ionicons 
          name="leaf" 
          size={80} 
          color={theme.colors.primary} 
          style={{ marginBottom: 16 }}
        />
        <Text style={{
          fontFamily: theme.typography.fontFamily.bold,
          fontSize: 24,
          color: theme.colors.text,
          textAlign: 'center',
        }}>
          SHANTHI APP
        </Text>
      </View>

      <ActivityIndicator 
        size="large" 
        color={theme.colors.primary} 
        style={{ marginBottom: 20 }}
      />
      <Text style={{
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 18,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 8,
      }}>
        Setting up your session...
      </Text>
      <Text style={{
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        opacity: 0.7,
      }}>
        Checking your profile and preferences
      </Text>
    </View>
  );
};