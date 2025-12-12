import { NavigatorScreenParams } from '@react-navigation/native';
import { Course, MediaItem } from '../data/mediaContent';

export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<MainStackParamList>;
};

export type MainStackParamList = {
  Loading: undefined;
  HomeTabs: NavigatorScreenParams<TabParamList>;
  Meditate: undefined;
  Mindfulness: undefined;
  Breathing: undefined;
  Move: undefined;
  CourseDetail: {
    course: Course;
  };
  AudioPlayer: {
    title: string;
    thumbnail: string;
    audioUrl: string;
    duration: string;
    playlist?: MediaItem[];
    currentIndex?: number;
  };
  VideoPlayer: {
    title: string;
    thumbnail: string;
    videoUrl: string;
    duration: string;
  };
};

export type TabParamList = {
  Home: undefined;
  Courses: undefined;
  Achievements: undefined;
};
