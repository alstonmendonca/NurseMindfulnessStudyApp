import React, { useState } from 'react';
import { Department } from '../types';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../navigation/types';
import { useNotifications } from '../hooks/useNotifications';
import { useParticipant } from '../contexts/ParticipantContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'WhatToExpect'>;

export const WhatToExpectScreen: React.FC<Props> = ({ navigation, route }) => {
  const { studyGroup, department } = route.params;
  const { scheduleNextNotification } = useNotifications();
  const { setParticipantData, setOnboardingComplete } = useParticipant();
  const [isLoading, setIsLoading] = useState(false);

  const description = studyGroup === 'control'
    ? "You'll be helping us understand nurses' well-being through regular check-ins. This includes:\n\n• Weekly research surveys\n• Optional daily mood & stress check-ins"
    : "You'll have access to support tools and help us understand nurses' well-being. This includes:\n\n• Weekly research surveys\n• Optional daily mood & stress check-ins\n• Calm Corner with relaxation tools\n• Private journaling space";

  const handleGetStarted = async () => {
    setIsLoading(true);
    try {
      // Save the study group assignment
  await setParticipantData({ studyGroup, department });

      // Schedule initial notifications
      await scheduleNextNotification('daily-checkin');
      await scheduleNextNotification('research-checkin');
      
      if (studyGroup === 'intervention') {
        await scheduleNextNotification('motivation');
      }

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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>What to Expect</Text>
        
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
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 30,
  },
  note: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    margin: 20,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
