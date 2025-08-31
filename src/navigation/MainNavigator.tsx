import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { DemographicSurveyScreen } from '../screens/DemographicSurveyScreen';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../constants/theme';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainNavigator = () => {
  const { demographicSurveyCompleted } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerShadowVisible: true,
        headerTitleStyle: { color: theme.colors.text },
        headerTintColor: theme.colors.text,
      }}
    >
      {demographicSurveyCompleted ? (
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
