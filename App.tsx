import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from './src/contexts/AuthContext';
import * as Notifications from 'expo-notifications';
import * as Updates from 'expo-updates';
import { RootStackParamList } from './src/navigation/types';
import { MainNavigator } from './src/navigation/MainNavigator';
import { ParticipantProvider } from './src/contexts/ParticipantContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { useFonts } from './src/hooks/useFonts';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { theme } from './src/constants/theme';
import { WiFiRequiredScreen } from './src/components/WiFiRequiredScreen';
import { ErrorBoundary } from './src/components/ErrorBoundary';
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

// Check for OTA updates on app launch
async function checkForUpdates() {
  if (__DEV__) {
    console.log('Skipping update check in development mode');
    return;
  }

  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      console.log('🔄 Update available, downloading...');
      await Updates.fetchUpdateAsync();
      console.log('✅ Update downloaded, reloading app...');
      await Updates.reloadAsync();
    } else {
      console.log('✅ App is up to date');
    }
  } catch (error) {
    console.log('Error checking for updates:', error);
    // Don't show error to user - just continue with current version
  }
}

export default function App() {
  const fontsLoaded = useFonts();
  const [isCheckingForUpdates, setIsCheckingForUpdates] = useState(true);

  // Check for updates on app launch
  useEffect(() => {
    const checkUpdates = async () => {
      await checkForUpdates();
      setIsCheckingForUpdates(false);
    };
    checkUpdates();
  }, []);

  // Set up notification handlers
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { type } = response.notification.request.content.data || {};

      // Handle the daily reminder notification
      if (type === 'daily-reminder') {
        // User tapped on the notification - they'll be taken to the app
        console.log('User opened app from daily reminder notification');
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Show loading screen while fonts are loading or checking for updates
  if (!fontsLoaded || isCheckingForUpdates) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.text} />
        <Text style={{ marginTop: 16, fontFamily: theme.typography.fontFamily.regular, color: theme.colors.text }}>
          {isCheckingForUpdates ? 'Checking for updates...' : 'Loading...'}
        </Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
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
              <StatusBar style="light" />
            </NavigationContainer>
          </ParticipantProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

// Separate navigator component to use hooks after providers are mounted
function AppNavigator() {
  const { participantNumber } = useAuth();
  const [isInternetConnected, setIsInternetConnected] = useState<boolean>(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(true);

  useEffect(() => {
    let networkChangeHandler: ((state: any) => void) | null = null;

    const initializeNetwork = async () => {
      try {
        await networkManager.initialize();
        const isConnected = networkManager.hasInternetConnection();
        setIsInternetConnected(isConnected);
        setIsCheckingConnection(false);

        // Listen for network changes
        networkChangeHandler = (state: any) => {
          setIsInternetConnected(networkManager.hasInternetConnection());
        };

        networkManager.addConnectivityListener(networkChangeHandler);
      } catch (error) {
        console.error('Error initializing network monitoring:', error);
        setIsCheckingConnection(false);
      }
    };

    initializeNetwork();

    return () => {
      if (networkChangeHandler) {
        networkManager.removeConnectivityListener(networkChangeHandler);
      }
    };
  }, []);

  // Show loading while checking internet connection status
  if (isCheckingConnection) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.text} />
        <Text style={{ marginTop: 16, fontFamily: theme.typography.fontFamily.regular, color: theme.colors.text }}>
          Checking network connection...
        </Text>
      </View>
    );
  }

  // Show internet required screen if not connected to internet
  if (!isInternetConnected) {
    return <WiFiRequiredScreen />;
  }

  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      {!participantNumber ? (
        <Stack.Screen name="Login" component={require('./src/screens/LoginScreen').LoginScreen} />
      ) : (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
}
