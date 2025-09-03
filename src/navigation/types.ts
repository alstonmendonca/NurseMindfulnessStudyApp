import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<MainStackParamList>;
};

export type MainStackParamList = {
  Home: undefined;
  DemographicSurvey: undefined;
};
