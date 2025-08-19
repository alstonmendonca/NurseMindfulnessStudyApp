import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { DailyCheckInScreen } from '../screens/DailyCheckInScreen';
import { CalmCornerScreen } from '../screens/CalmCornerScreen';
import { JournalScreen } from '../screens/JournalScreen';
import { JournalEntryScreen } from '../screens/JournalEntryScreen';
import { ResearchCheckInScreen } from '../screens/ResearchCheckInScreen';
import { useParticipant } from '../contexts/ParticipantContext';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainNavigator = () => {
  const { studyGroup } = useParticipant();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DailyCheckIn"
        component={DailyCheckInScreen}
        options={{ 
          title: 'Daily Check-In',
          headerTintColor: '#4A90E2',
        }}
      />
      {/* Only show these screens for intervention group */}
      {studyGroup === 'intervention' && (
        <>
          <Stack.Screen
            name="CalmCorner"
            component={CalmCornerScreen}
            options={{ title: 'Calm Corner' }}
          />
          <Stack.Screen
            name="Journal"
            component={JournalScreen}
            options={{ title: 'Journal' }}
          />
          <Stack.Screen
            name="JournalEntry"
            component={JournalEntryScreen}
            options={{ title: 'Write Entry' }}
          />
        </>
      )}
      <Stack.Screen
        name="ResearchCheckIn"
        component={ResearchCheckInScreen}
        options={({ route }) => ({
          title: route.params.type === 'PSS4' ? 'Stress Assessment' :
                route.params.type === 'COPE' ? 'Coping Strategies' :
                'Well-Being Check'
        })}
      />
    </Stack.Navigator>
  );
};
