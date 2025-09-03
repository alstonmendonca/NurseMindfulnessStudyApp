import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from './src/contexts/AuthContext';
import * as Notifications from 'expo-notifications';
import { RootStackParamList } from './src/navigation/types';
import { MainNavigator } from './src/navigation/MainNavigator';
import { ParticipantProvider } from './src/contexts/ParticipantContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { useFonts } from './src/hooks/useFonts';
import { View, Text, ActivityIndicator } from 'react-native';
import { theme } from './src/constants/theme';
import { WiFiRequiredScreen } from './src/components/WiFiRequiredScreen';
import { networkManager } from './src/utils/networkManager';

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
  const fontsLoaded = useFonts();

  // Set up notification handlers
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { type } = response.notification.request.content.data || {};

      // Handle different notification types
      if (type === 'daily-checkin') {
        // Navigate to daily check-in
      } else if (type === 'motivation') {
        // Handle motivational notification
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.text} />
        <Text style={{ marginTop: 16, fontFamily: theme.typography.fontFamily.regular, color: theme.colors.text }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <ParticipantProvider>
        <NavigationContainer theme={{
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: theme.colors.background,
            text: theme.colors.text,
            border: theme.colors.border,
            primary: theme.colors.text,
            card: theme.colors.background,
          },
        }}>
          <AppNavigator />
          <StatusBar style="dark" />
        </NavigationContainer>
      </ParticipantProvider>
    </AuthProvider>
  );
}

// Separate navigator component to use hooks after providers are mounted
function AppNavigator() {
  const { participantNumber } = useAuth();
  const [isWiFiConnected, setIsWiFiConnected] = useState<boolean>(false);
  const [isCheckingWiFi, setIsCheckingWiFi] = useState<boolean>(true);

  useEffect(() => {
    // Initialize network monitoring
    const initializeNetwork = async () => {
      try {
        await networkManager.initialize();
        const isConnected = networkManager.isWiFiConnected();
        setIsWiFiConnected(isConnected);
        setIsCheckingWiFi(false);

        // Listen for network changes
        const handleNetworkChange = (state: any) => {
          setIsWiFiConnected(networkManager.isWiFiConnected());
        };

        networkManager.addConnectivityListener(handleNetworkChange);
        
        return () => {
          networkManager.removeConnectivityListener(handleNetworkChange);
        };
      } catch (error) {
        console.error('Error initializing network monitoring:', error);
        setIsCheckingWiFi(false);
      }
    };

    initializeNetwork();
  }, []);

  // Show loading while checking WiFi status
  if (isCheckingWiFi) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.text} />
        <Text style={{ marginTop: 16, fontFamily: theme.typography.fontFamily.regular, color: theme.colors.text }}>
          Checking network connection...
        </Text>
      </View>
    );
  }

  // Show WiFi required screen if not connected to WiFi
  if (!isWiFiConnected) {
    return <WiFiRequiredScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!participantNumber ? (
        <Stack.Screen name="Login" component={require('./src/screens/LoginScreen').LoginScreen} />
      ) : (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
}
