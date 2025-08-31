import { NavigatorScreenParams } from '@react-navigation/native';
import { Department, StudyGroup } from '../types';

export type RootStackParamList = {
  Login: undefined;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  Consent: undefined;
  DepartmentSelect: undefined;
  WhatToExpect: { department: Department };
  Login: undefined; // Added Login screen
};

export type MainStackParamList = {
  Home: undefined;
  DemographicSurvey: undefined;
};
