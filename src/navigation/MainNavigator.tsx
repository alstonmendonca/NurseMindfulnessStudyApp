import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { LoadingScreen } from '../screens/LoadingScreen';
import { MeditateScreen } from '../screens/MeditateScreen';
import { MindfulnessScreen } from '../screens/MindfulnessScreen';
import { BreathingScreen } from '../screens/BreathingScreen';
import { MoveScreen } from '../screens/MoveScreen';
import { CourseDetailScreen } from '../screens/CourseDetailScreen';
import { AudioPlayerScreen } from '../screens/AudioPlayerScreen';
import { VideoPlayerScreen } from '../screens/VideoPlayerScreen';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../constants/theme';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainNavigator = () => {
  const { isInitializing } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerShadowVisible: true,
        headerTitleStyle: { color: theme.colors.text },
        headerTintColor: theme.colors.text,
      }}
    >
      {isInitializing ? (
        <Stack.Screen
          name="Loading"
          component={LoadingScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="HomeTabs"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Meditate"
            component={MeditateScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Mindfulness"
            component={MindfulnessScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Breathing"
            component={BreathingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Move"
            component={MoveScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CourseDetail"
            component={CourseDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AudioPlayer"
            component={AudioPlayerScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="VideoPlayer"
            component={VideoPlayerScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};
