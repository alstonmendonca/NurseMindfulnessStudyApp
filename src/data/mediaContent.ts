// Audio and Video content for the app
// Google Drive URLs for all media files

export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  duration: string;
  category: string;
  thumbnail: string;
  url: string;
  type: 'audio' | 'video';
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  thumbnail: string;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  title: string;
  content: string[];
  exercise?: {
    title: string;
    instructions: string[];
  };
}

// Courses - Educational content about mindfulness and meditation
export const coursesContent: Course[] = [
  {
    id: 'course-1',
    title: 'Stress Relief for Healthcare Workers',
    description: 'Learn practical techniques to manage workplace stress and prevent burnout',
    duration: '5 min read',
    category: 'Stress Management',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
    lessons: [
      {
        title: 'Understanding Healthcare Stress',
        content: [
          'Healthcare work is uniquely demanding. Long shifts, emotional challenges, and high-stakes decisions create persistent stress that can affect your wellbeing.',
          'Stress isn\'t just mental - it manifests physically through tension, fatigue, and decreased immunity. Recognizing these signs early is crucial for prevention.',
          'Research shows that healthcare workers who practice regular stress management techniques report better job satisfaction and patient care outcomes.',
        ],
        exercise: {
          title: '5-4-3-2-1 Grounding Exercise',
          instructions: [
            'Name 5 things you can see around you',
            'Name 4 things you can touch',
            'Name 3 things you can hear',
            'Name 2 things you can smell',
            'Name 1 thing you can taste',
            'This exercise brings you to the present moment and reduces anxiety in under 2 minutes.',
          ],
        },
      },
    ],
  },
  {
    id: 'course-2',
    title: 'Mindful Breathing Basics',
    description: 'Master the fundamental breathing techniques for instant calm',
    duration: '4 min read',
    category: 'Breathing Techniques',
    thumbnail: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400',
    lessons: [
      {
        title: 'The Power of Your Breath',
        content: [
          'Your breath is the only autonomic function you can consciously control. This makes it a powerful tool for managing stress and emotions.',
          'When stressed, we breathe shallowly and rapidly. This triggers the fight-or-flight response, increasing heart rate and cortisol levels.',
          'Controlled breathing activates the parasympathetic nervous system, lowering blood pressure, heart rate, and stress hormones within minutes.',
          'The best part? You can practice breath control anywhere - during a busy shift, before a difficult conversation, or at home.',
        ],
        exercise: {
          title: 'Box Breathing Technique',
          instructions: [
            'Breathe IN slowly through your nose for 4 counts',
            'HOLD your breath for 4 counts',
            'Breathe OUT slowly through your mouth for 4 counts',
            'HOLD empty for 4 counts',
            'Repeat this cycle 4-5 times',
            'Used by Navy SEALs and emergency responders to stay calm under pressure.',
          ],
        },
      },
    ],
  },
  {
    id: 'course-3',
    title: 'Compassion Fatigue Recovery',
    description: 'Recognize and heal from emotional exhaustion in caregiving',
    duration: '5 min read',
    category: 'Emotional Wellness',
    thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',
    lessons: [
      {
        title: 'What is Compassion Fatigue?',
        content: [
          'Compassion fatigue is the emotional and physical exhaustion that comes from caring for others. It\'s different from burnout - it happens because you care deeply.',
          'Signs include: feeling numb to patients\' suffering, irritability, difficulty sleeping, intrusive thoughts about work, and loss of joy in activities you once loved.',
          'You\'re not weak or failing - compassion fatigue is a natural consequence of caring work. Acknowledging it is the first step to healing.',
          'Self-compassion is essential. You can\'t pour from an empty cup. Taking care of yourself enables you to provide better care to others.',
        ],
        exercise: {
          title: 'Self-Compassion Practice',
          instructions: [
            'Place your hand over your heart',
            'Say to yourself: "This is a moment of suffering"',
            'Follow with: "Suffering is part of life and caring work"',
            'Then say: "May I be kind to myself in this moment"',
            'Take three deep breaths',
            'Repeat this whenever you feel overwhelmed or self-critical.',
          ],
        },
      },
    ],
  },
  {
    id: 'course-4',
    title: 'Quick Mindfulness for Busy Shifts',
    description: 'Micro-practices you can do in seconds between tasks',
    duration: '3 min read',
    category: 'Workplace Mindfulness',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
    lessons: [
      {
        title: 'Mindfulness in Motion',
        content: [
          'You don\'t need 20 minutes of meditation. Research shows that micro-moments of mindfulness throughout your day are just as effective.',
          'These brief practices help reset your nervous system, improve focus, and prevent stress accumulation during long shifts.',
          'The key is consistency, not duration. Even 10 seconds of mindful awareness repeated throughout the day creates lasting change.',
        ],
        exercise: {
          title: 'STOP Technique',
          instructions: [
            'S - STOP what you\'re doing',
            'T - TAKE three deep breaths',
            'O - OBSERVE your body, thoughts, and feelings',
            'P - PROCEED with awareness and intention',
            'Use this between patients, before entering a room, or when you feel tension building.',
            'Takes less than 30 seconds but resets your entire system.',
          ],
        },
      },
    ],
  },
  {
    id: 'course-5',
    title: 'Sleep Hygiene for Night Shift Workers',
    description: 'Improve sleep quality when working irregular hours',
    duration: '4 min read',
    category: 'Sleep & Recovery',
    thumbnail: 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=400',
    lessons: [
      {
        title: 'Night Shift Sleep Challenges',
        content: [
          'Night shift work disrupts your circadian rhythm - your body\'s natural sleep-wake cycle. This can lead to chronic sleep deprivation affecting health and performance.',
          'Quality sleep is essential for memory consolidation, immune function, emotional regulation, and decision-making - all critical for healthcare work.',
          'Your body needs consistency. Try to maintain the same sleep schedule even on days off, as much as possible.',
          'Light exposure is key: bright light keeps you alert at work, complete darkness helps you sleep during the day.',
        ],
        exercise: {
          title: 'Wind-Down Routine',
          instructions: [
            'After your shift, wear sunglasses on the way home to limit light exposure',
            'Make your bedroom completely dark - blackout curtains, no electronics',
            'Do this body scan: tense and release each muscle group from toes to head',
            'Practice 4-7-8 breathing: inhale for 4, hold for 7, exhale for 8',
            'Repeat breathing 4 times',
            'This signals your body it\'s time to sleep, regardless of the time of day.',
          ],
        },
      },
    ],
  },
  {
    id: 'course-6',
    title: 'Managing Anxiety Before Shifts',
    description: 'Calm pre-work nerves and start your day with confidence',
    duration: '4 min read',
    category: 'Anxiety Management',
    thumbnail: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=400',
    lessons: [
      {
        title: 'Pre-Shift Anxiety',
        content: [
          'Feeling anxious before work is common, especially in high-stakes healthcare environments. It\'s your brain\'s way of preparing for challenges.',
          'However, excessive anxiety can impair performance, decision-making, and your ability to be present with patients.',
          'The goal isn\'t to eliminate anxiety completely - some nervous energy can enhance performance. The goal is to manage it so it helps rather than hinders.',
          'Routine and preparation are anxiety\'s antidotes. Building a pre-shift ritual gives your mind structure and control.',
        ],
        exercise: {
          title: 'Confidence Anchoring',
          instructions: [
            'Before your shift, sit quietly for 2 minutes',
            'Recall a moment when you handled a difficult situation well',
            'Visualize it in detail - what you did, how you felt afterward',
            'Notice the feeling of confidence in your body',
            'Press your thumb and forefinger together while feeling this',
            'Throughout your shift, press these fingers together to recall this confident state.',
            'This is called "anchoring" - a technique used by athletes and performers.',
          ],
        },
      },
    ],
  },
];

// Meditation Tracks - For Meditate screen (accessed from Home)
// Organized by duration categories
export const meditationContent: MediaItem[] = [
  {
    id: 'med-1',
    title: '5 Minute Meditation Music for Instant Inner Peace',
    description: '5 Minutes by Great Meditation',
    duration: '5 min',
    category: '5 Minute Meditations',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
    url: 'https://drive.google.com/uc?export=download&id=14HUaS3arZL_1nNfgfx0kYLRubLByXkFQ',
    type: 'audio',
  },
  {
    id: 'med-2',
    title: '5 Minute Sound Bath - Sound Healing Vibes For Relaxation & Stress Relief',
    description: 'Sound Healing for quick relaxation',
    duration: '5 min',
    category: '5 Minute Meditations',
    thumbnail: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400',
    url: 'https://drive.google.com/uc?export=download&id=1ios3BHt5JqceXQGNUHq2ohS845IAOgVy',
    type: 'audio',
  },
  {
    id: 'med-3',
    title: '10 Minutes Morning Relaxing Music with Birds Singing',
    description: '10 Minute Relaxation with nature sounds',
    duration: '10 min',
    category: '10 Minute Meditations',
    thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',
    url: 'https://drive.google.com/uc?export=download&id=1z342eFasOeMLAs92wQEWTsbecguDVJPt',
    type: 'audio',
  },
  {
    id: 'med-4',
    title: 'Short 10 Min Nature Sounds Meditation',
    description: 'Nature sounds meditation',
    duration: '10 min',
    category: '10 Minute Meditations',
    thumbnail: 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=400',
    url: 'https://drive.google.com/uc?export=download&id=1HG6QpXbbqIl6HZQvdxB3PLcs7RtnFXUG',
    type: 'audio',
  },
  {
    id: 'med-5',
    title: 'Meditation Version 1',
    duration: '12 min',
    category: 'Guided Meditation',
    thumbnail: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=400',
    url: 'https://drive.google.com/uc?export=download&id=1MrEzLQf9cPhwEVZUCkiXDEoOg9DMUmuH',
    type: 'audio',
  },
  {
    id: 'med-6',
    title: 'Meditation Version 2',
    duration: '15 min',
    category: 'Guided Meditation',
    thumbnail: 'https://images.unsplash.com/photo-1602192509154-0b900ee1f851?w=400',
    url: 'https://drive.google.com/uc?export=download&id=1p2tpFTnMaruPKPqirl2gRCBtQ-f3maDQ',
    type: 'audio',
  },
  {
    id: 'med-7',
    title: 'Meditation Version 3',
    duration: '20 min',
    category: 'Guided Meditation',
    thumbnail: 'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=400',
    url: 'https://drive.google.com/uc?export=download&id=1mU9Yr6aAgWJBAisac6baJgPr0iJZbGu7',
    type: 'audio',
  },
];

// Helper function to get meditations by category
export const getMeditationsByCategory = () => {
  const categories: { [key: string]: MediaItem[] } = {};
  
  meditationContent.forEach((item) => {
    if (!categories[item.category]) {
      categories[item.category] = [];
    }
    categories[item.category].push(item);
  });
  
  return categories;
};

// Get mindfulness sounds organized by subcategory
export const getMindfulnessByCategory = (): { [key: string]: MediaItem[] } => {
  const allMindfulnessSounds = [...natureSounds, ...ambientSounds];
  const categories: { [key: string]: MediaItem[] } = {};

  allMindfulnessSounds.forEach((item) => {
    let category = 'Other';
    
    // Categorize based on title keywords
    if (item.title.toLowerCase().includes('ocean')) {
      category = 'Ocean Sounds';
    } else if (item.title.toLowerCase().includes('rain') && item.title.toLowerCase().includes('thunder')) {
      category = 'Rain & Thunder';
    } else if (item.title.toLowerCase().includes('rain')) {
      category = 'Rain Sounds';
    } else if (item.title.toLowerCase().includes('fire')) {
      category = 'Fire Sounds';
    } else if (item.title.toLowerCase().includes('brown noise')) {
      category = 'Brown Noise';
    } else if (item.title.toLowerCase().includes('nature')) {
      category = 'Nature Sounds';
    }

    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(item);
  });

  return categories;
};

// Nature Sounds
export const natureSounds: MediaItem[] = [
  {
    id: 'nature-1',
    title: 'Ocean Sounds Version 1',
    duration: '30 min',
    category: 'Nature Sounds',
    thumbnail: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400',
    url: 'https://drive.google.com/uc?export=download&id=1eiuIUXssfNrLqxF4bjXPoD8nPgEhS1bf',
    type: 'audio',
  },
  {
    id: 'nature-2',
    title: 'Light Rain Sounds',
    duration: '30 min',
    category: 'Nature Sounds',
    thumbnail: 'https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?w=400',
    url: 'https://drive.google.com/uc?export=download&id=1aSnZXU2V_ZfNZpMtLdZrwyZdLYZj02u3',
    type: 'audio',
  },
  {
    id: 'nature-3',
    title: 'Heavy Rain Sounds Version 1',
    duration: '30 min',
    category: 'Nature Sounds',
    thumbnail: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400',
    url: 'https://drive.google.com/uc?export=download&id=1aYU4sLnpWM0MMSli4dU2oeIKo8JgOdOh',
    type: 'audio',
  },
  {
    id: 'nature-4',
    title: 'Heavy Rain Sounds Version 2',
    duration: '30 min',
    category: 'Nature Sounds',
    thumbnail: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=400',
    url: 'https://drive.google.com/uc?export=download&id=1md6XBXJ31J9zuYF9HylHkIN07sqQy7P4',
    type: 'audio',
  },
  {
    id: 'nature-5',
    title: 'Rain + Thunder Sounds',
    duration: '30 min',
    category: 'Nature Sounds',
    thumbnail: 'https://images.unsplash.com/photo-1501706362039-c06b2d715385?w=400',
    url: 'https://drive.google.com/uc?export=download&id=18HqgeTiuBoLF8mMr9MxdQBkdmW_iLMgP',
    type: 'audio',
  },
  {
    id: 'nature-6',
    title: 'Nature + Rain Sounds',
    duration: '30 min',
    category: 'Nature Sounds',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
    url: 'https://drive.google.com/uc?export=download&id=1KPdEXVUkQkwzbxieviwANtR-uYE_pNJA',
    type: 'audio',
  },
];

// Ambient Sounds
export const ambientSounds: MediaItem[] = [
  {
    id: 'ambient-1',
    title: 'Fire Sounds',
    duration: '60 min',
    category: 'Ambient Sounds',
    thumbnail: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=400',
    url: 'https://drive.google.com/uc?export=download&id=1lZrazuSfSLddfvbNAmccbHni4GkJUsmj',
    type: 'audio',
  },
  {
    id: 'ambient-2',
    title: 'Brown Noise Version 1',
    duration: '60 min',
    category: 'Ambient Sounds',
    thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400',
    url: 'https://drive.google.com/uc?export=download&id=1ihAWYMsPJtNdLM4xwlXlb4uUFPUdd0ON',
    type: 'audio',
  },
  {
    id: 'ambient-3',
    title: 'Brown Noise Version 2',
    duration: '60 min',
    category: 'Ambient Sounds',
    thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400',
    url: 'https://drive.google.com/uc?export=download&id=1Zy170rZyvhvHJryYEIMRx7igOhRLhE23',
    type: 'audio',
  },
  {
    id: 'ambient-4',
    title: 'Brown Noise Version 3',
    duration: '60 min',
    category: 'Ambient Sounds',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400',
    url: 'https://drive.google.com/uc?export=download&id=1xRTdhu3KDZpOaDhQOZG5JfEeZFaFXfCV',
    type: 'audio',
  },
  {
    id: 'ambient-5',
    title: 'Brown Noise Version 4',
    duration: '60 min',
    category: 'Ambient Sounds',
    thumbnail: 'https://images.unsplash.com/photo-1614850523296-7c2f414c2355?w=400',
    url: 'https://drive.google.com/uc?export=download&id=1SpjLNGr8mW7XsXQ_Uv4i0BHeTdfPh0cU',
    type: 'audio',
  },
];

// Movement/Stretch Videos
export const moveVideos: MediaItem[] = [
  {
    id: 'move-1',
    title: '5-Minute Daily Stretch (Quick Routine)',
    description: 'Quick daily stretching routine to energize your body',
    duration: '5 min',
    category: 'Daily Stretch',
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    url: 'https://drive.google.com/uc?export=download&id=1yv6HG6dFfh-cT7LFHox2JM4yztuHXjrG',
    type: 'video',
  },
  {
    id: 'move-2',
    title: '5-Minute Full Body Daily Stretch',
    description: 'Complete full body stretching routine for daily wellness',
    duration: '5 min',
    category: 'Daily Stretch',
    thumbnail: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400',
    url: 'https://drive.google.com/uc?export=download&id=11jLnilwWVuTlWHBKlYqMSIftqnewotdH',
    type: 'video',
  },
  {
    id: 'move-3',
    title: '5-Minute Morning Stretch & Mobility',
    description: 'Morning stretches to improve flexibility and mobility',
    duration: '5 min',
    category: 'Morning Stretch',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
    url: 'https://drive.google.com/uc?export=download&id=1LkE2sTeDDOuHBKGFmvIp3WVz3q7bqdhh',
    type: 'video',
  },
];

// Get movement videos organized by category
export const getMoveVideosByCategory = (): { [key: string]: MediaItem[] } => {
  const categories: { [key: string]: MediaItem[] } = {};

  moveVideos.forEach((item) => {
    if (!categories[item.category]) {
      categories[item.category] = [];
    }
    categories[item.category].push(item);
  });

  return categories;
};

// Breathing Exercise Videos
export const breathingVideos: MediaItem[] = [
  {
    id: 'breath-1',
    title: 'Guided Breathing — Version 1',
    description: 'Breathing exercise to reduce stress and anxiety',
    duration: '2 min',
    category: 'Guided Breathing',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
    url: 'https://drive.google.com/uc?export=download&id=1KQ6K--SAVrR1w6sZdOcxTv3xiFboiw2V',
    type: 'video',
  },
  {
    id: 'breath-2',
    title: 'Guided Breathing — Version 2',
    description: 'Deep breathing exercise for relaxation',
    duration: '5 min',
    category: 'Guided Breathing',
    thumbnail: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400',
    url: 'https://drive.google.com/uc?export=download&id=11c_hmjSimLnJV7Kh--cfF22sE-kYYcA7',
    type: 'video',
  },
  {
    id: 'breath-3',
    title: 'Guided Breathing — Version 3',
    description: 'Extended breathing session for deep relaxation',
    duration: '10 min',
    category: 'Guided Breathing',
    thumbnail: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400',
    url: 'https://drive.google.com/uc?export=download&id=1g9pVLqHbW92hZIQpX8b3YV7jz6QM7izH',
    type: 'video',
  },
  {
    id: 'breath-4',
    title: '4-Minute Centering Meditation',
    description: 'Quick centering meditation with breathing focus',
    duration: '4 min',
    category: 'Meditation & Breathing',
    thumbnail: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400',
    url: 'https://drive.google.com/uc?export=download&id=1dQH0HAsYQZ3mh0qY2GJi0bxK6p1Gok96',
    type: 'video',
  },
  {
    id: 'breath-5',
    title: 'Progressive Muscle Relaxation — Stress Reduction Guide',
    description: 'Progressive muscle relaxation for stress relief',
    duration: '15 min',
    category: 'Progressive Relaxation',
    thumbnail: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=400',
    url: 'https://drive.google.com/uc?export=download&id=1V9IuPajzrgBAs_uM_ImCIEp9cb8DhNXf',
    type: 'video',
  },
  {
    id: 'breath-6',
    title: 'Progressive Muscle Relaxation for Anxiety Relief',
    description: 'Progressive relaxation technique to ease anxiety',
    duration: '20 min',
    category: 'Progressive Relaxation',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
    url: 'https://drive.google.com/uc?export=download&id=15_M-x1XNNDGRCaG2-w48ild9Yifhod80',
    type: 'video',
  },
];

// Get breathing videos organized by category
export const getBreathingVideosByCategory = (): { [key: string]: MediaItem[] } => {
  const categories: { [key: string]: MediaItem[] } = {};

  breathingVideos.forEach((item) => {
    if (!categories[item.category]) {
      categories[item.category] = [];
    }
    categories[item.category].push(item);
  });

  return categories;
};
