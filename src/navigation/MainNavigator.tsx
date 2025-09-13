import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { DemographicSurveyScreen } from '../screens/DemographicSurveyScreen';
import { LoadingScreen } from '../screens/LoadingScreen';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../constants/theme';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainNavigator = () => {
  const { demographicSurveyCompleted, isInitializing } = useAuth();

  return (
    <Stack.Navigator
      id={undefined}
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
      ) : demographicSurveyCompleted ? (
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="DemographicSurvey"
          component={DemographicSurveyScreen}
          options={{ 
            title: 'Demographic Survey',
            headerLeft: () => null, // Prevent going back
          }}
        />
      )}
    </Stack.Navigator>
  );
};
