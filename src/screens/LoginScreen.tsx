import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { theme } from '../constants/theme';
import { Screen } from '../components/Screen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../contexts/AuthContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login, isLoading } = useAuth();
  const [participantNumber, setParticipantNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!participantNumber.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both participant number and password');
      return;
    }

    try {
      await login(participantNumber.trim(), password.trim());
      // If login is successful, navigation will automatically proceed due to 
      // the navigation logic in App.tsx
    } catch (error) {
      Alert.alert(
        'Login Failed',
        'Please check your participant number and password and try again.'
      );
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to Shanthi</Text>
            <Text style={styles.subtitle}>
              Your personal companion for peace, mindfulness, and well-being
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Participant Number</Text>
                <TextInput
                  style={styles.input}
                  value={participantNumber}
                  onChangeText={setParticipantNumber}
                  placeholder="Enter your participant number"
                  placeholderTextColor={theme.colors.mutedText}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.colors.mutedText}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <PrimaryButton
                label={isLoading ? "Signing In..." : "Sign In"}
                onPress={handleLogin}
                disabled={isLoading}
                style={styles.loginButton}
              />
            </View>
          </View>

          {/* Footer Section */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              This app is part of a research study to support nurses' mental health
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 32,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: theme.typography.subtitle,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.mutedText,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  form: {
    gap: theme.spacing.xl,
  },
  inputGroup: {
    gap: theme.spacing.sm,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  input: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.overlay,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  loginButton: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: theme.spacing.xl,
  },
  footerText: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.mutedText,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
});
