import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from './types';

import { WelcomeScreen } from '../screens/WelcomeScreen';
import { ConsentScreen } from '../screens/ConsentScreen';
import { DepartmentSelectScreen } from '../screens/DepartmentSelectScreen';
import { WhatToExpectScreen } from '../screens/WhatToExpectScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Consent" component={ConsentScreen} />
      <Stack.Screen name="DepartmentSelect" component={DepartmentSelectScreen} />
      <Stack.Screen name="WhatToExpect" component={WhatToExpectScreen} />
    </Stack.Navigator>
  );
};
