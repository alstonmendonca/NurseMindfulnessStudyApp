import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { theme } from '../constants/theme';
import { Screen } from '../components/Screen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <Screen title="Welcome to Shanthi" subtitle="This app is part of a research study to support nurses' mental health.">
      <View style={styles.content}>
        <Text style={styles.description}>
          Your personal companion for peace, mindfulness, and well-being during your nursing shifts.
        </Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Consent')}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 24,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.mutedText,
    lineHeight: 22,
  },
  button: {
    backgroundColor: theme.colors.button,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: theme.colors.button,
    marginBottom: 30,
    marginHorizontal: 20,
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
