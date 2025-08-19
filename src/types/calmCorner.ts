export interface SoundType {
  id: string;
  name: string;
  source: string;
  icon: string;
}

export interface GroundingExercise {
  id: string;
  title: string;
  instructions: string[];
  duration: string;
}

export interface GratitudeEntry {
  id: string;
  text: string;
  timestamp: string;
  shift: 'day' | 'night';
  department: string;
}

export type CalmCornerActivity = 'breathing' | 'sounds' | 'grounding' | 'gratitude';
