import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Text, TextInput, Alert } from 'react-native';
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to NurseWell</Text>
        <Text style={styles.subtitle}>
          Please enter your participant number and password to continue
        </Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={participantNumber}
            onChangeText={setParticipantNumber}
            placeholder="Participant Number"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="number-pad"
          />

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <PrimaryButton
            label={isLoading ? "Logging in..." : "Log In"}
            onPress={handleLogin}
            disabled={isLoading}
            style={styles.loginButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  form: {
    gap: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  loginButton: {
    marginTop: 10,
  },
});
