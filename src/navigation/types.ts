import { NavigatorScreenParams } from '@react-navigation/native';
import { Department, StudyGroup } from '../types';

export type RootStackParamList = {
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  Consent: undefined;
  DepartmentSelect: undefined;
  WhatToExpect: { studyGroup: StudyGroup };
};

export type MainStackParamList = {
  Home: undefined;
  DailyCheckIn: undefined;
  ResearchCheckIn: { type: 'PSS4' | 'COPE' | 'WHO5' };
  CalmCorner: {
    initialActivity?: 'breathing' | 'sounds' | 'grounding' | 'gratitude';
  };
  Journal: undefined;
  JournalEntry: { prompt?: string };
};
