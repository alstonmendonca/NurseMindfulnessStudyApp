import React, { useState } from 'react';
import { Department } from '../types';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../constants/theme';
import { Screen } from '../components/Screen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../navigation/types';
import { useNotifications } from '../hooks/useNotifications';
import { useParticipant } from '../contexts/ParticipantContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'WhatToExpect'>;

export const WhatToExpectScreen: React.FC<Props> = ({ navigation, route }) => {
  const { department } = route.params;
  const { scheduleNextNotification } = useNotifications();
  const { setParticipantData, setOnboardingComplete } = useParticipant();
  const [isLoading, setIsLoading] = useState(false);

  const description = "You'll be helping us understand nurses' well-being through regular check-ins and have access to support tools. This includes:\n\n• Weekly research surveys\n• Optional daily mood & stress check-ins\n• Calm Corner with relaxation tools\n• Private journaling space";

  const handleGetStarted = async () => {
    setIsLoading(true);
    try {
      // Save the department selection
      await setParticipantData({ department });

      // Schedule initial notifications
      await scheduleNextNotification('daily-checkin');
      await scheduleNextNotification('research-checkin');
      await scheduleNextNotification('motivation');

      // Mark onboarding as complete
  await setOnboardingComplete();
  // Navigation will be handled automatically by App.tsx
    } catch (error) {
      Alert.alert(
        'Error',
        'There was a problem setting up your notifications. You can enable them later in settings.',
      );
  // Still complete onboarding
  await setOnboardingComplete();
  // Navigation will be handled automatically by App.tsx
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen title="What to Expect">
      <View style={styles.content}>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.note}>
          Your participation helps advance our understanding of healthcare workers' mental health.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleGetStarted}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Setting up...' : 'Get Started'}
        </Text>
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
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 30,
    color: theme.colors.text,
  },
  note: {
    fontSize: 16,
    color: theme.colors.mutedText,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: theme.colors.button,
    paddingVertical: 15,
    margin: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: theme.colors.button,
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
