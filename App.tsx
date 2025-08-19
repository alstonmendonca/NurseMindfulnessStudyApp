import 'react-native-get-random-values';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useParticipant } from './src/contexts/ParticipantContext';
import * as Notifications from 'expo-notifications';
import { RootStackParamList } from './src/navigation/types';
import { OnboardingNavigator } from './src/navigation/OnboardingNavigator';
import { MainNavigator } from './src/navigation/MainNavigator';
import { ParticipantProvider } from './src/contexts/ParticipantContext';
import { SharedProvider } from './src/contexts/SharedContext';


// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  // Set up notification handlers
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { type } = response.notification.request.content.data || {};

      // Handle different notification types
      if (type === 'research-checkin') {
        // Navigate to research check-in
      } else if (type === 'daily-checkin') {
        // Navigate to daily check-in
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <ParticipantProvider>
      <SharedProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </SharedProvider>
    </ParticipantProvider>
  );
}

// Separate navigator component to use hooks after providers are mounted
function AppNavigator() {
  const { hasCompletedOnboarding } = useParticipant();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!hasCompletedOnboarding ? (
        <Stack.Screen 
          name="Onboarding"
          component={OnboardingNavigator}
          options={{ gestureEnabled: false }}
        />
      ) : (
        <Stack.Screen 
          name="Main"
          component={MainNavigator}
        />
      )}
    </Stack.Navigator>
  );
}
