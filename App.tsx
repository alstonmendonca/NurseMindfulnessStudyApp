import 'react-native-get-random-values';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from './src/contexts/AuthContext';
import * as Notifications from 'expo-notifications';
import { RootStackParamList } from './src/navigation/types';
import { OnboardingNavigator } from './src/navigation/OnboardingNavigator';
import { MainNavigator } from './src/navigation/MainNavigator';
import { ParticipantProvider } from './src/contexts/ParticipantContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { SharedProvider } from './src/contexts/SharedContext';


// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,  // Shows notification as banner when app is in foreground
    shouldShowList: true,    // Shows notification in notification list/drawer
    shouldPlaySound: true,   // Plays notification sound
    shouldSetBadge: false,   // Don't show app badge count
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
    <AuthProvider>
      <ParticipantProvider>
        <SharedProvider>
          <NavigationContainer>
            <AppNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </SharedProvider>
      </ParticipantProvider>
    </AuthProvider>
  );
}

// Separate navigator component to use hooks after providers are mounted
function AppNavigator() {
  const { participantNumber, completedOnboarding } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!participantNumber ? (
        <Stack.Screen name="Login" component={require('./src/screens/LoginScreen').LoginScreen} />
      ) : !completedOnboarding ? (
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} options={{ gestureEnabled: false }} />
      ) : (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
}
