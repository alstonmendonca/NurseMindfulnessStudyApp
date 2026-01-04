import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { Screen } from '../components/Screen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { BackgroundDoodles } from '../components/BackgroundDoodles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { networkManager } from '../utils/networkManager';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login, isLoading } = useAuth();
  const [participantNumber, setParticipantNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  
  // Determine if it's a small screen (less than 700px height)
  const isSmallScreen = screenHeight < 700;

  const handleLogin = async () => {
    if (!participantNumber.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both participant number and password');
      return;
    }

    // Check for internet connection
    if (!networkManager.hasInternetConnection()) {
      Alert.alert(
        'No Internet Connection',
        'Please check your internet connection and try again.'
      );
      return;
    }

    try {
      await login(participantNumber.trim(), password.trim());
      // If login is successful, navigation will automatically proceed due to 
      // the navigation logic in App.tsx
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Please check your participant number and password and try again.';
      
      // Handle specific error cases
      if (error.message === 'Invalid credentials') {
        errorMessage = 'The participant number or password you entered is incorrect.';
      } else if (error.message && error.message.includes('Network request failed')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      }

      Alert.alert('Login Failed', errorMessage);
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
          contentContainerStyle={[
            styles.scrollContent,
            { 
              paddingTop: insets.top + (isSmallScreen ? 10 : 20),
              paddingBottom: insets.bottom + 20,
            }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
            <View style={[styles.iconContainer, isSmallScreen && styles.iconContainerSmall]}>
              <MaterialIcons name="self-improvement" size={isSmallScreen ? 48 : 64} color={theme.colors.primary} />
            </View>
            <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>Welcome to Shanthi</Text>
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
                    color={theme.colors.mutedText} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={participantNumber}
                    onChangeText={setParticipantNumber}
                    placeholder="Enter your participant number"
                    placeholderTextColor={theme.colors.mutedText}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="number-pad"
                    returnKeyType="next"
                    accessibilityLabel="Participant Number Input"
                    accessibilityHint="Enter your assigned participant number"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons 
                    name="lock-outline" 
                    size={20} 
                    color={theme.colors.mutedText} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={theme.colors.mutedText}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    accessibilityLabel="Password Input"
                    accessibilityHint="Enter your password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                    accessibilityRole="button"
                  >
                    <MaterialIcons 
                      name={showPassword ? "visibility-off" : "visibility"} 
                      size={20} 
                      color={theme.colors.mutedText} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
                accessibilityLabel="Sign In Button"
                accessibilityRole="button"
                accessibilityState={{ disabled: isLoading }}
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
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  headerSmall: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  iconContainerSmall: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 32,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    letterSpacing: -0.5,
  },
  titleSmall: {
    fontSize: 26,
    marginBottom: theme.spacing.sm,
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
    paddingVertical: theme.spacing.md,
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
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary, // Changed to primary for visibility
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
