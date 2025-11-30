import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Alert, KeyboardAvoidingView, Platform, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { Screen } from '../components/Screen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { BackgroundDoodles } from '../components/BackgroundDoodles';

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login, isLoading } = useAuth();
  const [participantNumber, setParticipantNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    <View style={styles.container}>
      <BackgroundDoodles />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="self-improvement" size={64} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>Welcome to Shanthi</Text>
            <Text style={styles.subtitle}>
              Your mindfulness companion for peace and well-being
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Participant Number</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons 
                    name="person-outline" 
                    size={20} 
                    color={theme.colors.textSecondary} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={participantNumber}
                    onChangeText={setParticipantNumber}
                    placeholder="Enter your participant number"
                    placeholderTextColor={theme.colors.textSecondary}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="number-pad"
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons 
                    name="lock-outline" 
                    size={20} 
                    color={theme.colors.textSecondary} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <MaterialIcons 
                      name={showPassword ? "visibility-off" : "visibility"} 
                      size={20} 
                      color={theme.colors.textSecondary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? "Signing In..." : "Sign In"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 20,
    paddingBottom: 20,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingTop: theme.spacing.xxxl + 20,
    paddingBottom: theme.spacing.xl,
  },
  iconContainer: {
    marginBottom: theme.spacing.xl,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
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
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  formContainer: {
    paddingVertical: theme.spacing.xl,
    minHeight: 320, // Ensure minimum height for form
  },
  form: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    ...theme.shadows.lg,
    gap: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputGroup: {
    gap: theme.spacing.sm,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#FFFFFF',
    marginLeft: theme.spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.background,
    ...theme.shadows.sm,
  },
  inputIcon: {
    marginLeft: theme.spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text,
    backgroundColor: 'transparent',
  },
  passwordInput: {
    paddingRight: theme.spacing.sm,
  },
  eyeButton: {
    padding: theme.spacing.md,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.lg,
    paddingVertical: theme.spacing.lg + 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    ...theme.shadows.md,
  },
  loginButtonDisabled: {
    backgroundColor: theme.colors.textLight,
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 18,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textOnPrimary,
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  footerIconContainer: {
    marginRight: theme.spacing.sm,
  },
  footerText: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});
