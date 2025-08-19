import { SoundType, GroundingExercise } from '../types/calmCorner';

export const SOOTHING_SOUNDS: SoundType[] = [
  {
    id: 'white-noise',
    name: 'White Noise',
    source: require('../../assets/sounds/white-noise.mp3'),
    icon: '🌫️',
  },
  {
    id: 'brown-noise',
    name: 'Brown Noise',
    source: require('../../assets/sounds/brown-noise.mp3'),
    icon: '🌊',
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    source: require('../../assets/sounds/ocean.mp3'),
    icon: '🌊',
  },
  {
    id: 'rain',
    name: 'Rainfall',
    source: require('../../assets/sounds/rain.mp3'),
    icon: '🌧️',
  },
];

export const GROUNDING_EXERCISES: GroundingExercise[] = [
  {
    id: '5-senses',
    title: '5 Senses Exercise',
    duration: '2-3 minutes',
    instructions: [
      'Find 5 things you can see',
      'Notice 4 things you can touch',
      'Listen for 3 different sounds',
      'Identify 2 things you can smell',
      'Focus on 1 thing you can taste',
    ],
  },
  {
    id: 'body-scan',
    title: 'Quick Body Scan',
    duration: '1-2 minutes',
    instructions: [
      'Close your eyes or find a soft focus',
      'Notice any tension in your shoulders',
      'Relax your jaw and facial muscles',
      'Feel your feet connecting to the ground',
      'Take three deep breaths',
    ],
  },
  {
    id: 'present-moment',
    title: 'Present Moment Anchor',
    duration: '1 minute',
    instructions: [
      'Look around and name 3 things you can see',
      'Take a deep breath',
      'Notice where you are right now',
      'Say today\'s date in your mind',
      'Remind yourself: "I am here now"',
    ],
  },
];
