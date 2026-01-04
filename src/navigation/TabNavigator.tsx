import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { AchievementsScreen } from '../screens/AchievementsScreen';
import { theme } from '../constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  const isAndroid = Platform.OS === 'android';
  const bottomInset = Math.max(insets.bottom, isAndroid ? 16 : 24);
  const tabBarHeight = (isAndroid ? 60 : 70) + bottomInset;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.background, // Main background
          borderTopWidth: 0,
          elevation: 0,
          height: tabBarHeight,
          paddingBottom: bottomInset,
          paddingTop: 10,
        },
        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: theme.colors.mutedText,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: theme.typography.fontFamily.medium,
          marginTop: 4,
        },
        tabBarSafeAreaInsets: { bottom: bottomInset },
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarLabel: 'HOME',
        }}
      />
      <Tab.Screen
        name="Courses"
        component={CoursesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
          tabBarLabel: 'COURSES',
        }}
      />
      <Tab.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          tabBarLabel: 'ACHIEVEMENTS',
        }}
      />
    </Tab.Navigator>
  );
};
