import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, ImageBackground, Dimensions, Modal } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { theme } from '../constants/theme';
import { Screen } from '../components/Screen';
import { Audio, Video, ResizeMode } from 'expo-av';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '../utils/supabase';
import { appUsageTracker } from '../utils/appUsageTracker';

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<MainStackParamList, 'Home'>;

interface AudioItem {
  id: string;
  name: string;
  description: string;
  url: string;
  type: 'audio';
  category: string;
}

interface VideoItem {
  id: string;
  name: string;
  description: string;
  url: string;
  type: 'video';
  duration: string;
}

type MediaItem = AudioItem | VideoItem;

// Helper function to render icon based on category and type
const renderIcon = (item: any, size: number = 24, color: string = theme.colors.text) => {
  // For now, use simple category-based icons
  if (item.category === 'nature') {
    if (item.name.includes('Ocean')) return <Ionicons name="water" size={size} color={color} />;
    if (item.name.includes('Rain')) return <Ionicons name="rainy" size={size} color={color} />;
    if (item.name.includes('Thunder')) return <Ionicons name="flash" size={size} color={color} />;
    return <Ionicons name="leaf" size={size} color={color} />;
  }
  if (item.category === 'ambient' || item.name.includes('Noise')) {
    return <MaterialIcons name="graphic-eq" size={size} color={color} />;
  }
  if (item.category === 'meditation' || item.name.includes('Meditation')) {
    return <MaterialIcons name="self-improvement" size={size} color={color} />;
  }
  if (item.type === 'video') {
    return <Ionicons name="play-circle" size={size} color={color} />;
  }
  return <Ionicons name="musical-notes" size={size} color={color} />;
};

// Enhanced media items with real Google Drive URLs
const mediaItems: MediaItem[] = [
  // Nature Sounds
  {
    id: 'ocean',
    name: 'Ocean Sounds',
    description: 'Gentle waves for deep relaxation and peaceful sleep',
    url: 'https://drive.google.com/uc?export=download&id=1eiuIUXssfNrLqxF4bjXPoD8nPgEhS1bf',
    type: 'audio',
    category: 'nature',
  },
  {
    id: 'heavy-rain-1',
    name: 'Heavy Rain v1',
    description: 'Intense rainfall for deep focus and relaxation',
    url: 'https://drive.google.com/uc?export=download&id=1aYU4sLnpWM0MMSli4dU2oeIKo8JgOdOh',
    type: 'audio',
    category: 'nature',
  },
  {
    id: 'heavy-rain-2',
    name: 'Heavy Rain v2',
    description: 'Alternative heavy rain sounds for variety',
    url: 'https://drive.google.com/uc?export=download&id=1md6XBXJ31J9zuYF9HylHkIN07sqQy7P4',
    type: 'audio',
    category: 'nature',
  },
  {
    id: 'light-rain',
    name: 'Light Rain',
    description: 'Gentle rainfall for peaceful moments',
    url: 'https://drive.google.com/uc?export=download&id=1aSnZXU2V_ZfNZpMtLdZrwyZdLYZj02u3',
    type: 'audio',
    category: 'nature',
  },
  {
    id: 'nature-rain',
    name: 'Nature + Rain',
    description: 'Combined nature sounds with gentle rain',
    url: 'https://drive.google.com/uc?export=download&id=1KPdEXVUkQkwzbxieviwANtR-uYE_pNJA',
    type: 'audio',
    category: 'nature',
  },
  {
    id: 'rain-thunder',
    name: 'Rain + Thunder',
    description: 'Dramatic storms for powerful relaxation',
    url: 'https://drive.google.com/uc?export=download&id=18HqgeTiuBoLF8mMr9MxdQBkdmW_iLMgP',
    type: 'audio',
    category: 'nature',
  },
  
  // Ambient Sounds
  {
    id: 'fire',
    name: 'Crackling Fire',
    description: 'Warm and cozy fireplace sounds',
    url: 'https://drive.google.com/uc?export=download&id=1lZrazuSfSLddfvbNAmccbHni4GkJUsmj',
    type: 'audio',
    category: 'ambient',
  },
  {
    id: 'brown-noise-1',
    name: 'Brown Noise v1',
    description: 'Deep focus and concentration sound',
    url: 'https://drive.google.com/uc?export=download&id=1ihAWYMsPJtNdLM4xwlXlb4uUFPUdd0ON',
    type: 'audio',
    category: 'ambient',
  },
  {
    id: 'brown-noise-2',
    name: 'Brown Noise v2',
    description: 'Alternative brown noise for variety',
    url: 'https://drive.google.com/uc?export=download&id=1Zy170rZyvhvHJryYEIMRx7igOhRLhE23',
    type: 'audio',
    category: 'ambient',
  },
  {
    id: 'brown-noise-3',
    name: 'Brown Noise v3',
    description: 'Third variation of calming brown noise',
    url: 'https://drive.google.com/uc?export=download&id=1xRTdhu3KDZpOaDhQOZG5JfEeZFaFXfCV',
    type: 'audio',
    category: 'ambient',
  },
  {
    id: 'brown-noise-4',
    name: 'Brown Noise v4',
    description: 'Fourth brown noise option for extended listening',
    url: 'https://drive.google.com/uc?export=download&id=1SpjLNGr8mW7XsXQ_Uv4i0BHeTdfPh0cU',
    type: 'audio',
    category: 'ambient',
  },
  
  // Meditation Music
  {
    id: 'meditation-1',
    name: 'Meditation Audio v1',
    description: 'Foundational mindfulness meditation audio',
    url: 'https://drive.google.com/uc?export=download&id=1MrEzLQf9cPhwEVZUCkiXDEoOg9DMUmuH',
    type: 'audio',
    category: 'meditation',
  },
  {
    id: 'meditation-2',
    name: 'Meditation Audio v2',
    description: 'Meditation for deeper practice',
    url: 'https://drive.google.com/uc?export=download&id=1p2tpFTnMaruPKPqirl2gRCBtQ-f3maDQ',
    type: 'audio',
    category: 'meditation',
  },
  {
    id: 'meditation-3',
    name: 'Meditation Audio v3',
    description: 'Meditation Audio for calmer mind',
    url: 'https://drive.google.com/uc?export=download&id=1mU9Yr6aAgWJBAisac6baJgPr0iJZbGu7',
    type: 'audio',
    category: 'meditation',
  },
  {
    id: 'sound-bath-5min',
    name: '5 Minute Sound Bath Meditation',
    description: 'Crystal singing bowls and Tibetan bowls for deep relaxation',
    url: 'https://drive.google.com/uc?export=download&id=1ios3BHt5JqceXQGNUHq2ohS845IAOgVy',
    type: 'audio',
    category: 'meditation',
  },
  {
    id: 'inner-peace-5min',
    name: '5 Minute Inner Peace Meditation',
    description: 'Meditation music for instant inner peace and calm',
    url: 'https://drive.google.com/uc?export=download&id=14HUaS3arZL_1nNfgfx0kYLRubLByXkFQ',
    type: 'audio',
    category: 'meditation',
  },
  {
    id: 'forest-birds-10min',
    name: '10 Min Forest Morning Birds',
    description: 'Nature sounds meditation - birds chirping calms the nervous system',
    url: 'https://drive.google.com/uc?export=download&id=1HG6QpXbbqIl6HZQvdxB3PLcs7RtnFXUG',
    type: 'audio',
    category: 'meditation',
  },
  {
    id: 'morning-birds-10min',
    name: '10 Min Morning Relaxation with Birds',
    description: 'Morning relaxation music with peaceful bird songs',
    url: 'https://drive.google.com/uc?export=download&id=1z342eFasOeMLAs92wQEWTsbecguDVJPt',
    type: 'audio',
    category: 'meditation',
  },
  
  // Guided Breathing Videos (Only these are videos)
  {
    id: 'breathing-1',
    name: 'Box Square Breathing',
    description: 'A short relaxation exercise to reduce stress and anxiety.',
    url: 'https://drive.google.com/uc?export=download&id=1KQ6K--SAVrR1w6sZdOcxTv3xiFboiw2V',
    type: 'video',
    duration: '1 min',
  },
  {
    id: 'breathing-2',
    name: '4-7-8 Breathing',
    description: 'Breathing exercise to improve focus and regulate emotions',
    url: 'https://drive.google.com/uc?export=download&id=11c_hmjSimLnJV7Kh--cfF22sE-kYYcA7',
    type: 'video',
    duration: '1 min',
  },
  {
    id: 'breathing-3',
    name: '5 minutes Guided Breathing',
    description: 'A 5-minute guided breathing exercise',
    url: 'https://drive.google.com/uc?export=download&id=1g9pVLqHbW92hZIQpX8b3YV7jz6QM7izH',
    type: 'video',
    duration: '5 min',
  }
];

// Lesson data structure for the Learn section
interface Lesson {
  id: string;
  title: string;
  objective: string;
  keyPoints: string[];
  practice: {
    duration: string;
    instructions: string;
  };
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

const learningContent: Chapter[] = [
  {
    id: 'foundations',
    title: 'Foundations of Meditation for Healthcare Professionals',
    lessons: [
      {
        id: 'intro-meditation',
        title: 'Lesson 1: Introduction to Meditation',
        objective: 'Understand what meditation is and why it matters.',
        keyPoints: [
          'Meditation is the practice of training attention and awareness.',
          'Benefits include stress reduction, improved focus, emotional balance, and better sleep.',
          'For healthcare workers, meditation supports resilience against burnout and compassion fatigue.'
        ],
        practice: {
          duration: '2 min',
          instructions: 'Sit comfortably, close your eyes, and focus on your breath for 5 cycles. Notice any distractions without judgment.'
        }
      },
      {
        id: 'breathing-awareness',
        title: 'Lesson 2: Breathing Awareness',
        objective: 'Learn to anchor attention using the breath.',
        keyPoints: [
          'The breath is always available and can help regulate stress.',
          'Deep breathing activates the parasympathetic nervous system (rest & digest).'
        ],
        practice: {
          duration: '3 min',
          instructions: 'Inhale slowly for 4 counts. Hold for 2 counts. Exhale for 6 counts. Repeat for 5 rounds.'
        }
      },
      {
        id: 'body-scan',
        title: 'Lesson 3: Body Scan Meditation',
        objective: 'Develop awareness of physical sensations to release tension.',
        keyPoints: [
          'Nurses and healthcare workers often hold stress in the body unconsciously.',
          'Scanning from head to toe helps identify areas of tightness and promotes relaxation.'
        ],
        practice: {
          duration: '5 min',
          instructions: 'Close your eyes. Bring attention to your head, then slowly move down through shoulders, chest, arms, abdomen, legs, and feet. Simply notice sensations (warmth, tightness, tingling) without trying to change them.'
        }
      },
      {
        id: 'loving-kindness',
        title: 'Lesson 4: Loving-Kindness Meditation',
        objective: 'Cultivate compassion for self and others.',
        keyPoints: [
          'Healthcare professionals often prioritize others and neglect themselves.',
          'Loving-kindness (Metta) builds empathy, patience, and emotional strength.'
        ],
        practice: {
          duration: '4 min',
          instructions: 'Repeat silently: "May I be healthy. May I be safe. May I be at peace." Extend the same wishes to a colleague, a patient, and finally all beings.'
        }
      },
      {
        id: 'mindfulness-daily',
        title: 'Lesson 5: Mindfulness in Daily Practice',
        objective: 'Integrate meditation into work and personal life.',
        keyPoints: [
          'Even short pauses (1–2 minutes) during a shift can reset the mind.',
          'Mindful walking, mindful eating, or mindful handwashing are practical ways to practice.'
        ],
        practice: {
          duration: '2-3 min',
          instructions: 'While washing hands, focus on the sensation of water, soap, and movement instead of rushing.'
        }
      }
    ]
  },
  {
    id: 'stress-burnout',
    title: 'Chapter 1: Stress & Burnout Management',
    lessons: [
      {
        id: 'stress-responses',
        title: 'Lesson 1: Understanding Stress Responses',
        objective: 'Recognize and understand how stress affects the body and mind.',
        keyPoints: [
          'Stress activates the body\'s "fight or flight" mode.',
          'Chronic stress in healthcare can lead to burnout, fatigue, and reduced compassion.',
          'Awareness of stress signals (tight shoulders, racing thoughts, irritability) is the first step to managing it.',
          'Not all stress is harmful—small amounts can boost alertness if managed well.'
        ],
        practice: {
          duration: '2 min',
          instructions: 'Place your hand on your chest, take 3 slow breaths, and notice how your body feels before and after.'
        }
      },
      {
        id: 'quick-reset',
        title: 'Lesson 2: Quick Reset Practices During Shifts',
        objective: 'Learn rapid techniques to reset your nervous system during work.',
        keyPoints: [
          'Even 30–60 seconds can reset your nervous system.',
          'Short pauses help reduce mistakes and improve decision-making.',
          'A "reset ritual" (breath, stretch, posture check) can be done between patients.',
          'This prevents stress from building up unnoticed.'
        ],
        practice: {
          duration: '1 min',
          instructions: 'Stop, close your eyes, inhale deeply, roll your shoulders back, exhale fully, then open your eyes with renewed focus.'
        }
      },
      {
        id: 'grounding-techniques',
        title: 'Lesson 3: Grounding Techniques for Overwhelm',
        objective: 'Use grounding to stay present during intense situations.',
        keyPoints: [
          'Grounding pulls attention away from racing thoughts into the present.',
          'Useful during emergencies or emotionally intense moments.',
          'Techniques include sensory awareness and touch.',
          'Helps prevent feeling "stuck in your head."'
        ],
        practice: {
          duration: '2 min',
          instructions: 'The 5-4-3-2-1 Method — Notice 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.'
        }
      },
      {
        id: 'compassion-fatigue',
        title: 'Lesson 4: Managing Compassion Fatigue',
        objective: 'Protect emotional energy and restore empathy capacity.',
        keyPoints: [
          'Constant exposure to suffering can reduce emotional energy.',
          'Recognizing signs (numbness, irritability, detachment) is important.',
          'Small self-care moments restore empathy capacity.',
          'Sharing experiences with peers reduces emotional burden.'
        ],
        practice: {
          duration: '3 min',
          instructions: 'Silently repeat: "I acknowledge my effort. I am human. I deserve care too."'
        }
      },
      {
        id: 'healthy-boundaries',
        title: 'Lesson 5: Creating Healthy Boundaries',
        objective: 'Learn to protect energy and prevent burnout through boundaries.',
        keyPoints: [
          'Boundaries protect energy and prevent burnout.',
          'Saying "no" respectfully is an act of self-care.',
          'Clear separation of work and personal life improves resilience.',
          'Micro-boundaries (no phones at meals, deep breaths before entering work) add up.'
        ],
        practice: {
          duration: '2 min',
          instructions: 'At the end of your shift, close your eyes and imagine leaving all work worries at the hospital door before going home.'
        }
      }
    ]
  },
  {
    id: 'mindful-communication',
    title: 'Chapter 2: Mindful Communication',
    lessons: [
      {
        id: 'active-listening',
        title: 'Lesson 1: Active Listening with Patients',
        objective: 'Develop deeper listening skills to improve patient care.',
        keyPoints: [
          'Listening fully helps patients feel valued and safe.',
          'Silence can be as powerful as words.',
          'Avoid multitasking during patient interactions when possible.',
          'Reflecting back what you hear builds trust.'
        ],
        practice: {
          duration: '2 min',
          instructions: 'In your next conversation, pause for 2 breaths before replying. Notice if it changes the tone.'
        }
      },
      {
        id: 'responding-vs-reacting',
        title: 'Lesson 2: Responding vs. Reacting in Tense Situations',
        objective: 'Learn to respond mindfully rather than react impulsively.',
        keyPoints: [
          'Reacting is impulsive; responding is mindful and intentional.',
          'Pausing creates space to choose words wisely.',
          'Emotional awareness helps prevent escalation.',
          'A calm response models stability for patients and colleagues.'
        ],
        practice: {
          duration: '1 min',
          instructions: 'When feeling triggered, silently say "Pause. Breathe. Respond." before speaking.'
        }
      },
      {
        id: 'compassionate-speech',
        title: 'Lesson 3: Compassionate Speech with Colleagues',
        objective: 'Foster positive team communication and reduce conflict.',
        keyPoints: [
          'Stress can cause harsh words, even unintentionally.',
          'Compassionate speech fosters teamwork and reduces conflict.',
          'Using "I" statements avoids blame.',
          'Gratitude and encouragement improve morale.'
        ],
        practice: {
          duration: '2 min',
          instructions: 'Pick one colleague today and thank them for something specific they did.'
        }
      },
      {
        id: 'de-escalation',
        title: 'Lesson 4: De-escalation Mindfulness Tools',
        objective: 'Use mindfulness to calm tense situations.',
        keyPoints: [
          'Patients and families may express fear through anger.',
          'Calm tone and body language are more effective than words alone.',
          'Slow breathing regulates your nervous system and influences theirs.',
          'Non-judgmental presence defuses tension.'
        ],
        practice: {
          duration: '2 min',
          instructions: 'Inhale deeply, exhale slowly twice before entering a difficult conversation.'
        }
      },
      {
        id: 'empathy-boundaries',
        title: 'Lesson 5: Practicing Empathy without Over-Identification',
        objective: 'Balance compassionate care with emotional self-protection.',
        keyPoints: [
          'Empathy is feeling with others, not becoming overwhelmed by their emotions.',
          'Over-identification can drain energy and cause emotional spillover.',
          'Mindful empathy balances care with self-preservation.',
          'Compassion means showing up fully without absorbing suffering.'
        ],
        practice: {
          duration: '3 min',
          instructions: 'Visualize a protective boundary around yourself—open enough to care, firm enough to stay grounded.'
        }
      }
    ]
  },
  {
    id: 'sleep-recovery',
    title: 'Chapter 3: Sleep & Recovery',
    lessons: [
      {
        id: 'importance-rest',
        title: 'Lesson 1: The Importance of Rest in Healthcare',
        objective: 'Understand why rest is crucial for healthcare professionals.',
        keyPoints: [
          'Sleep restores body, mind, and emotional stability.',
          'Night shifts and long hours often disrupt natural rhythms.',
          'Sleep debt increases errors and reduces compassion.',
          'Prioritizing rest is part of professional responsibility.'
        ],
        practice: {
          duration: '2 min',
          instructions: 'Before bed, place your phone away and take 5 slow breaths to signal "sleep mode" to your body.'
        }
      },
      {
        id: 'evening-rituals',
        title: 'Lesson 2: Evening Mindfulness Rituals',
        objective: 'Create consistent routines to improve sleep quality.',
        keyPoints: [
          'A consistent wind-down routine improves sleep quality.',
          'Dim lights, reduce screen time, and engage in calming activities.',
          'Short meditation before bed helps release mental clutter.',
          'Rituals train the body to associate cues with rest.'
        ],
        practice: {
          duration: '5 min',
          instructions: 'Try a simple gratitude journaling: write down 3 things that went well today.'
        }
      },
      {
        id: 'breathwork-sleep',
        title: 'Lesson 3: Breathwork for Better Sleep',
        objective: 'Use breathing techniques to prepare for restful sleep.',
        keyPoints: [
          'Breathing regulates the nervous system before sleep.',
          'Slow, deep breaths reduce heart rate and calm the mind.',
          'A regular practice conditions the body for rest.',
          'Works especially well after late shifts.'
        ],
        practice: {
          duration: '3 min',
          instructions: 'Inhale for 4 counts, exhale for 8 counts. Continue for 5 rounds.'
        }
      },
      {
        id: 'body-scan-sleep',
        title: 'Lesson 4: Body Scan for Bedtime Relaxation',
        objective: 'Release physical tension to promote deeper rest.',
        keyPoints: [
          'Releasing physical tension promotes deeper rest.',
          'Many nurses carry stress in shoulders, neck, and lower back.',
          'Scanning the body directs awareness away from thoughts into sensations.',
          'A relaxed body leads to a calmer mind.'
        ],
        practice: {
          duration: '5 min',
          instructions: 'Lie down, bring awareness from head to toe, gently noticing and relaxing each part.'
        }
      },
      {
        id: 'intrusive-thoughts',
        title: 'Lesson 5: Letting Go of Intrusive Thoughts',
        objective: 'Calm racing thoughts that interfere with sleep.',
        keyPoints: [
          'Racing thoughts are a common barrier to sleep.',
          'Observing thoughts without engaging helps calm the mind.',
          'Writing them down externalizes worries.',
          'Visualization can guide the mind toward peace.'
        ],
        practice: {
          duration: '3 min',
          instructions: 'Imagine placing each thought onto a cloud, watching it drift away until the sky clears.'
        }
      }
    ]
  }
];

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { logout, participantNumber } = useAuth();
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMediaId, setCurrentMediaId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'nature' | 'ambient' | 'meditation' | 'video' | 'learn'>('nature');
  
  // Usage statistics
  const [usageStats, setUsageStats] = useState({
    totalDays: 0,
    totalSessions: 0,
    totalMinutes: 0,
  });
  
  // Audio progress tracking
  const [audioPosition, setAudioPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  
  // Loading states
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  
  // Media caching

  const [downloadProgress, setDownloadProgress] = useState<Map<string, number>>(new Map());
  const [isDownloading, setIsDownloading] = useState<Set<string>>(new Set());
  
  // Video player state
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [videoStatus, setVideoStatus] = useState<any>({});
  const videoRef = useRef<Video>(null);
  
  // Lesson state
  const [isLessonModalVisible, setIsLessonModalVisible] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

  const handleLogout = () => {
    // Logout is now instant with fire-and-forget session ending
    logout();
  };

  // Fetch usage statistics from Supabase
  const fetchUsageStats = async () => {
    if (!participantNumber) return;

    try {
      const { data, error } = await supabase
        .from('app_usage_sessions')
        .select('session_start, session_end, duration_minutes')
        .eq('participant_number', participantNumber)
        .not('session_end', 'is', null) // Only completed sessions
        .not('duration_minutes', 'is', null)
        .not('session_start', 'is', null); // Ensure session_start is not null

      if (error) {
        console.error('Error fetching usage stats:', error);
        return;
      }

      if (data && data.length > 0) {
        // Filter out any remaining null/invalid entries for extra safety
        const validSessions = data.filter(session => {
          return session.session_start && 
                 session.session_end && 
                 session.duration_minutes !== null && 
                 session.duration_minutes !== undefined &&
                 session.duration_minutes > 0; // Ignore 0 or negative duration
        });

        console.log(`Found ${validSessions.length} valid sessions out of ${data.length} total`);

        if (validSessions.length === 0) {
          // No valid sessions, keep stats at 0
          setUsageStats({
            totalDays: 0,
            totalSessions: 0,
            totalMinutes: 0,
          });
          return;
        }

        // Calculate total sessions (only valid ones)
        const totalSessions = validSessions.length;

        // Calculate total minutes (only from valid sessions)
        const totalMinutes = validSessions.reduce((sum, session) => {
          const duration = parseInt(session.duration_minutes) || 0;
          return sum + Math.max(0, duration); // Ensure no negative values
        }, 0);

        // Calculate unique days (only from valid sessions)
        const uniqueDates = new Set();
        validSessions.forEach(session => {
          try {
            if (session.session_start) {
              const date = new Date(session.session_start);
              // Validate the date is actually valid
              if (!isNaN(date.getTime())) {
                const dateString = date.toDateString();
                uniqueDates.add(dateString);
              }
            }
          } catch (dateError) {
            console.warn('Invalid date in session:', session.session_start);
          }
        });
        const totalDays = uniqueDates.size;

        console.log(`Usage stats: ${totalDays} days, ${totalSessions} sessions, ${totalMinutes} minutes`);

        setUsageStats({
          totalDays: Math.max(0, totalDays),
          totalSessions: Math.max(0, totalSessions),
          totalMinutes: Math.max(0, totalMinutes),
        });
      } else {
        // No data found, ensure stats are 0
        setUsageStats({
          totalDays: 0,
          totalSessions: 0,
          totalMinutes: 0,
        });
      }
    } catch (error) {
      console.error('Error in fetchUsageStats:', error);
      // On error, don't update stats (keep previous values or defaults)
    }
  };

  // Load usage stats when component mounts
  useEffect(() => {
    fetchUsageStats();
  }, [participantNumber]);

  // Initialize app usage tracking when HomeScreen loads
  useEffect(() => {
    const initializeUsageTracking = async () => {
      if (participantNumber) {
        try {
          await appUsageTracker.initializeTracking(participantNumber);
          console.log('App usage tracking started from HomeScreen');
        } catch (error) {
          console.error('Error starting app usage tracking:', error);
        }
      }
    };

    initializeUsageTracking();
  }, [participantNumber]);

  // Helper function to format time in MM:SS format
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayAudio = async (item: AudioItem) => {
    try {
      // Stop current sound if playing
      if (currentSound) {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
        setCurrentSound(null);
        setIsPlaying(false);
        setAudioPosition(0);
        setAudioDuration(0);
      }

      if (currentMediaId === item.id && isPlaying) {
        // If same audio is playing, stop it
        setCurrentMediaId(null);
        return;
      }

      // Show loading state
      setIsAudioLoading(true);
      setCurrentMediaId(item.id);

      console.log('Loading audio from URL:', item.name);
      
      // Set up audio session for background playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Create and load audio directly from URL
      const { sound } = await Audio.Sound.createAsync(
        { uri: item.url },
        { 
          shouldPlay: false,
          isLooping: true, 
          volume: 0.8,
          progressUpdateIntervalMillis: 500
        }
      );

      // Wait for audio to be fully loaded
      let loadRetries = 0;
      const maxLoadRetries = 30; // 3 seconds max wait
      
      while (loadRetries < maxLoadRetries) {
        const loadStatus = await sound.getStatusAsync();
        if (loadStatus.isLoaded) {
          console.log('Audio fully loaded after', loadRetries * 100, 'ms');
          break;
        }
        
        if (!loadStatus.isLoaded) {
          throw new Error(`Audio loading failed`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        loadRetries++;
      }
      
      // Final check to ensure audio is loaded
      const finalLoadStatus = await sound.getStatusAsync();
      if (!finalLoadStatus.isLoaded) {
        throw new Error('Audio failed to load within timeout period');
      }

      // Set up playback status listener
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          console.error('Audio playback error: Audio not loaded');
          Alert.alert('Playback Error', 'Unable to play this audio file');
          setIsPlaying(false);
          setCurrentMediaId(null);
          setIsAudioLoading(false);
          setAudioPosition(0);
          setAudioDuration(0);
        } else {
          // Update position and duration
          if (status.positionMillis !== undefined) {
            setAudioPosition(status.positionMillis);
          }
          if (status.durationMillis !== undefined) {
            setAudioDuration(status.durationMillis);
          }
          
          // Update playing state
          setIsPlaying(status.isPlaying || false);
          
          // Handle playback completion
          if (status.didJustFinish && !status.isLooping) {
            setIsPlaying(false);
            setCurrentMediaId(null);
            setAudioPosition(0);
          }
        }
      });
      
      // Start playback
      await sound.playAsync();
      
      setCurrentSound(sound);
      setIsPlaying(true);
      setIsAudioLoading(false);
      
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio. Please check your internet connection and try again.');
      
      // Reset states on error
      setIsPlaying(false);
      setCurrentMediaId(null);
      setIsAudioLoading(false);
      setAudioPosition(0);
      setAudioDuration(0);
      setCurrentSound(null);
    }
  };

  const handlePlayVideo = async (item: VideoItem) => {
    try {
      // Stop any currently playing audio
      if (currentSound) {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
        setCurrentSound(null);
        setIsPlaying(false);
        setCurrentMediaId(null);
        setAudioPosition(0);
        setAudioDuration(0);
      }

      // Set loading state and open modal
      setIsVideoLoading(true);
      setCurrentVideo(item);
      setIsVideoModalVisible(true);
    } catch (error) {
      console.error('Error opening video:', error);
      Alert.alert('Error', 'Failed to open video player');
      setIsVideoLoading(false);
    }
  };

  const closeVideoPlayer = async () => {
    if (videoRef.current) {
      await videoRef.current.stopAsync();
    }
    setIsVideoModalVisible(false);
    setCurrentVideo(null);
    setVideoStatus({});
    setIsVideoLoading(false);
  };
  
  const openLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setIsLessonModalVisible(true);
  };
  
  const closeLessonModal = () => {
    setIsLessonModalVisible(false);
    setCurrentLesson(null);
  };

  // Handle video status updates
  const handleVideoStatusUpdate = (status: any) => {
    setVideoStatus(status);
    if (status.isLoaded) {
      setIsVideoLoading(false);
    }
  };

  const handleMediaPress = (item: MediaItem) => {
    if (item.type === 'audio') {
      handlePlayAudio(item as AudioItem);
    } else {
      handlePlayVideo(item as VideoItem);
    }
  };

  const stopCurrentMedia = async () => {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      setCurrentSound(null);
    }
    setIsPlaying(false);
    setCurrentMediaId(null);
    setAudioPosition(0);
    setAudioDuration(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop current sound
      if (currentSound) {
        currentSound.unloadAsync();
      }
      
      setAudioPosition(0);
      setAudioDuration(0);
    };
  }, [currentSound]);

  // Set up progress tracking interval when audio is playing
  useEffect(() => {
    let progressInterval: ReturnType<typeof setInterval>;
    
    if (currentSound && isPlaying) {
      progressInterval = setInterval(async () => {
        try {
          const status = await currentSound.getStatusAsync();
          if (status.isLoaded) {
            if (status.positionMillis !== undefined) {
              setAudioPosition(status.positionMillis);
            }
            if (status.durationMillis !== undefined) {
              setAudioDuration(status.durationMillis);
            }
          }
        } catch (error) {
          console.log('Error getting audio status:', error);
        }
      }, 500); // Update every 500ms for smooth progress
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [currentSound, isPlaying]);

  const getFilteredItems = () => {
    if (selectedCategory === 'video') {
      return mediaItems.filter(item => item.type === 'video');
    }
    if (selectedCategory === 'learn') {
      return []; // Learn section uses lesson data, not media items
    }
    return mediaItems.filter(item => item.type === 'audio' && (item as AudioItem).category === selectedCategory);
  };

  const getCurrentCategoryInfo = () => {
    switch (selectedCategory) {
      case 'nature':
        return {
          title: 'Nature Sounds',
          subtitle: 'Peaceful sounds to refresh and reawaken your senses',
          tags: ['PEACE', 'CALM', 'RELAXATION']
        };
      case 'ambient':
        return {
          title: 'Ambient Sounds',
          subtitle: 'Background sounds for focus and relaxation',
          tags: ['FOCUS', 'CONCENTRATION', 'AMBIENT']
        };
      case 'meditation':
        return {
          title: 'Meditation Music',
          subtitle: 'Guided meditation and calming music for mindfulness',
          tags: ['MEDITATION', 'MINDFULNESS', 'INNER PEACE']
        };
      case 'video':
        return {
          title: 'Guided Meditation',
          subtitle: 'Video-guided breathing and mindfulness exercises',
          tags: ['BREATHING', 'MEDITATION', 'MINDFULNESS']
        };
      case 'learn':
        return {
          title: 'Mindfulness Learning',
          subtitle: 'Interactive lessons on meditation and mindfulness for healthcare professionals',
          tags: ['EDUCATION', 'HEALTHCARE', 'PROFESSIONAL DEVELOPMENT']
        };
    }
  };

  const categoryInfo = getCurrentCategoryInfo();
  const filteredItems = getFilteredItems();

  return (
    <View style={styles.container}>
      {/* Header with sign out button */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerWelcome}>SHANTHI</Text>
          <TouchableOpacity 
            style={styles.signOutButton} 
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={16} color={theme.colors.text} />
            <Text style={styles.signOutButtonText}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>Welcome</Text>
            <Text style={styles.welcomeSubtitle}>Time updates every time you open the app</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{usageStats.totalDays}</Text>
                <Text style={styles.statLabel}>days</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{usageStats.totalSessions}</Text>
                <Text style={styles.statLabel}>sessions</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{usageStats.totalMinutes}m</Text>
                <Text style={styles.statLabel}>total</Text>
              </View>
            </View>
          </View>
          <View style={styles.welcomeIcon}>
            <MaterialIcons name="self-improvement" size={32} color={theme.colors.primary} />
          </View>
        </View>

        {/* Media List */}
        <View style={styles.mediaContainer}>
          {selectedCategory === 'learn' ? (
            // Learn Section - Lesson Chapters
            <View style={styles.learnContainer}>
              {learningContent.map((chapter) => (
                <View key={chapter.id} style={styles.chapterCard}>
                  <Text style={styles.chapterTitle}>{chapter.title}</Text>
                  <View style={styles.lessonsContainer}>
                    {chapter.lessons.map((lesson) => (
                      <TouchableOpacity 
                        key={lesson.id} 
                        style={styles.lessonCard}
                        onPress={() => openLesson(lesson)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.lessonHeader}>
                          <View style={styles.lessonIcon}>
                            <Ionicons name="book" size={20} color={theme.colors.primary} />
                          </View>
                          <Text style={styles.lessonTitle}>{lesson.title}</Text>
                        </View>
                        <Text style={styles.lessonObjective}>{lesson.objective}</Text>
                        <View style={styles.practiceInfo}>
                          <Ionicons name="time" size={14} color={theme.colors.textSecondary} />
                          <Text style={styles.practiceDuration}>{lesson.practice.duration}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : selectedCategory === 'video' ? (
            // Video Grid Layout - Improved Design
            <View style={styles.videoGrid}>
              {filteredItems.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.videoCard,
                    (currentMediaId === item.id && isVideoLoading) && styles.videoCardDisabled
                  ]}
                  onPress={() => handleMediaPress(item)}
                  disabled={currentMediaId === item.id && isVideoLoading}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.videoThumbnail,
                    (currentMediaId === item.id && isVideoLoading) && styles.videoThumbnailDisabled
                  ]}>
                    {/* Background gradient effect */}
                    <View style={styles.videoThumbnailGradient} />
                    
                    {/* Main icon */}
                    <View style={styles.videoThumbnailIcon}>
                      {renderIcon(item, 28, theme.colors.primary)}
                    </View>
                    
                    {/* Duration badge */}
                    <View style={styles.videoDurationBadge}>
                      <Text style={styles.videoDurationText}>
                        {(item as VideoItem).duration}
                      </Text>
                    </View>
                    
                    {/* Play button overlay */}
                    <View style={styles.videoPlayButtonOverlay}>
                      <View style={styles.videoPlayButton}>
                        <Ionicons 
                          name="play" 
                          size={18} 
                          color={theme.colors.textOnPrimary} 
                          style={{ marginLeft: 2 }}
                        />
                      </View>
                    </View>
                    
                    {/* Loading overlay */}
                    {currentMediaId === item.id && isVideoLoading && (
                      <View style={styles.videoLoadingOverlay}>
                        <View style={styles.videoLoadingSpinner}>
                          <MaterialIcons name="hourglass-empty" size={20} color={theme.colors.textOnPrimary} />
                        </View>
                        <Text style={styles.videoLoadingText}>Loading...</Text>
                      </View>
                    )}
                  </View>
                  
                  {/* Card content */}
                  <View style={styles.videoCardContent}>
                    <Text style={styles.videoCardTitle} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.videoCardDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            // Audio List Layout
            <View style={styles.audioList}>
              {filteredItems.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.audioItem,
                    currentMediaId === item.id && isPlaying && styles.audioItemActive,
                    (currentMediaId === item.id && isAudioLoading) && styles.audioItemDisabled
                  ]}
                  onPress={() => handleMediaPress(item)}
                  disabled={currentMediaId === item.id && isAudioLoading}
                >
                  <View style={styles.audioItemContent}>
                    <View style={[
                      styles.audioIcon,
                      (currentMediaId === item.id && isAudioLoading) && styles.audioIconDisabled
                    ]}>
                      <View style={styles.audioIconContainer}>
                        {renderIcon(item, 24, (currentMediaId === item.id && isAudioLoading) ? theme.colors.textLight : theme.colors.text)}
                      </View>
                      {currentMediaId === item.id && isPlaying && (
                        <View style={styles.audioPlayingIndicator}>
                          <View style={styles.audioPlayingDot} />
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.audioInfo}>
                      <Text style={styles.audioTitle}>{item.name}</Text>
                      <Text style={styles.audioDescription}>{item.description}</Text>
                      
                      {/* Enhanced Audio Waveform Visualization */}
                      <View style={styles.waveformContainer}>
                        {[4, 12, 8, 16, 6, 20, 14, 10, 18, 7, 15, 9, 13, 17, 5, 19, 11, 8, 14, 6].map((height, i) => (
                          <View
                            key={i}
                            style={[
                              styles.waveformBar,
                              {
                                height: currentMediaId === item.id && isPlaying 
                                  ? height 
                                  : Math.max(4, height * 0.4),
                                backgroundColor: currentMediaId === item.id && isPlaying 
                                  ? theme.colors.primary 
                                  : theme.colors.border
                              }
                            ]}
                          />
                        ))}
                      </View>
                    </View>

                    <View style={styles.audioControls}>
                      <TouchableOpacity 
                        style={[
                          styles.audioPlayButton,
                          (currentMediaId === item.id && isAudioLoading) && styles.audioPlayButtonDisabled
                        ]}
                        onPress={() => handleMediaPress(item)}
                        disabled={currentMediaId === item.id && isAudioLoading}
                      >
                        <View style={styles.audioPlayButtonIcon}>
                          {currentMediaId === item.id && isAudioLoading ? (
                            <MaterialIcons name="hourglass-empty" size={16} color={theme.colors.textLight} />
                          ) : currentMediaId === item.id && isPlaying ? (
                            <Ionicons name="pause" size={16} color={theme.colors.text} />
                          ) : (
                            <Ionicons name="play" size={16} color={theme.colors.text} />
                          )}
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.audioOptionsButton}>
                        <MaterialIcons name="more-horiz" size={16} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Enhanced Loading indicator for audio */}
                  {currentMediaId === item.id && isAudioLoading && (
                    <View style={styles.audioLoadingContainer}>
                      <View style={styles.audioLoadingBar}>
                        <View style={styles.audioLoadingIndicator} />
                      </View>
                      <Text style={styles.audioLoadingText}>Loading audio...</Text>
                    </View>
                  )}

                  {/* Progress bar for playing audio */}
                  {currentMediaId === item.id && isPlaying && !isAudioLoading && (
                    <View style={styles.audioProgressContainer}>
                      <View style={styles.audioProgressBar}>
                        <View style={[
                          styles.audioProgressFill,
                          {
                            width: audioDuration > 0 
                              ? `${(audioPosition / audioDuration) * 100}%` 
                              : '0%'
                          }
                        ]} />
                      </View>
                      <Text style={styles.audioProgressTime}>
                        {formatTime(audioPosition)} / {audioDuration > 0 ? formatTime(audioDuration) : '--:--'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Stop button when media is playing */}
        {isPlaying && (
          <View style={styles.controlSection}>
            <TouchableOpacity style={styles.stopButton} onPress={stopCurrentMedia}>
              <View style={styles.stopButtonContent}>
                <Ionicons name="stop" size={16} color={theme.colors.textOnPrimary} />
                <Text style={styles.stopButtonText}>Stop</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity
          style={[styles.navButton, selectedCategory === 'nature' && styles.navButtonActive]}
          onPress={() => setSelectedCategory('nature')}
        >
          <Ionicons 
            name="leaf" 
            size={24} 
            color={selectedCategory === 'nature' ? theme.colors.primary : theme.colors.text} 
          />
          <Text style={[styles.navButtonText, selectedCategory === 'nature' && styles.navButtonTextActive]}>
            Nature
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navButton, selectedCategory === 'ambient' && styles.navButtonActive]}
          onPress={() => setSelectedCategory('ambient')}
        >
          <MaterialIcons 
            name="graphic-eq" 
            size={24} 
            color={selectedCategory === 'ambient' ? theme.colors.primary : theme.colors.text} 
          />
          <Text style={[styles.navButtonText, selectedCategory === 'ambient' && styles.navButtonTextActive]}>
            Ambient
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navButton, selectedCategory === 'meditation' && styles.navButtonActive]}
          onPress={() => setSelectedCategory('meditation')}
        >
          <Ionicons 
            name="musical-notes" 
            size={24} 
            color={selectedCategory === 'meditation' ? theme.colors.primary : theme.colors.text} 
          />
          <Text style={[styles.navButtonText, selectedCategory === 'meditation' && styles.navButtonTextActive]}>
            Meditation
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navButton, selectedCategory === 'video' && styles.navButtonActive]}
          onPress={() => setSelectedCategory('video')}
        >
          <Ionicons 
            name="videocam" 
            size={24} 
            color={selectedCategory === 'video' ? theme.colors.primary : theme.colors.text} 
          />
          <Text style={[styles.navButtonText, selectedCategory === 'video' && styles.navButtonTextActive]}>
            Videos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navButton, selectedCategory === 'learn' && styles.navButtonActive]}
          onPress={() => setSelectedCategory('learn')}
        >
          <Ionicons 
            name="school" 
            size={24} 
            color={selectedCategory === 'learn' ? theme.colors.primary : theme.colors.text} 
          />
          <Text style={[styles.navButtonText, selectedCategory === 'learn' && styles.navButtonTextActive]}>
            Learn
          </Text>
        </TouchableOpacity>
      </View>

      {/* Video Player Modal */}
      <Modal
        visible={isVideoModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeVideoPlayer}
      >
        <View style={styles.videoModalContainer}>
          <View style={styles.videoModalContent}>
            {/* Video Header */}
            <View style={styles.videoHeader}>
              <TouchableOpacity style={styles.videoCloseButton} onPress={closeVideoPlayer}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <View style={styles.videoHeaderInfo}>
                <Text style={styles.videoHeaderTitle}>
                  {currentVideo?.name || 'Guided Meditation'}
                </Text>
                <Text style={styles.videoHeaderDescription}>
                  {currentVideo?.description || 'Mindful breathing exercise'}
                </Text>
              </View>
            </View>

            {/* Video Player */}
            <View style={styles.videoPlayerContainer}>
              {currentVideo && (
                <>
                  <Video
                    ref={videoRef}
                    style={styles.videoPlayer}
                    source={{ uri: currentVideo.url }}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping={false}
                    onPlaybackStatusUpdate={handleVideoStatusUpdate}
                    shouldPlay={true}
                  />
                  
                  {/* Video Loading Overlay */}
                  {isVideoLoading && (
                    <View style={styles.videoLoadingOverlay}>
                      <View style={styles.videoLoadingContainer}>
                        <View style={styles.videoLoadingIcon}>
                          <MaterialIcons name="hourglass-empty" size={24} color={theme.colors.text} />
                        </View>
                        <Text style={styles.videoLoadingText}>Loading video...</Text>
                        <View style={styles.videoLoadingBar}>
                          <View style={styles.videoLoadingIndicator} />
                        </View>
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Video Info */}
            <View style={styles.videoInfoContainer}>
              <View style={styles.videoInfoRow}>
                <Text style={styles.videoInfoLabel}>Duration:</Text>
                <Text style={styles.videoInfoValue}>{currentVideo?.duration}</Text>
              </View>
              <View style={styles.videoInfoRow}>
                <Text style={styles.videoInfoLabel}>Type:</Text>
                <Text style={styles.videoInfoValue}>Guided Meditation</Text>
              </View>
              <Text style={styles.videoInstructions}>
                Find a comfortable position, close your eyes if you'd like, and follow along with the guidance.
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Lesson Detail Modal */}
      <Modal
        visible={isLessonModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeLessonModal}
      >
        <View style={styles.lessonModalContainer}>
          <View style={styles.lessonModalHeader}>
            <TouchableOpacity style={styles.lessonCloseButton} onPress={closeLessonModal}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.lessonModalTitle}>
              {currentLesson?.title}
            </Text>
          </View>
          
          <ScrollView style={styles.lessonModalContent} showsVerticalScrollIndicator={false}>
            {currentLesson && (
              <>
                <View style={styles.lessonDetailCard}>
                  <Text style={styles.lessonObjectiveTitle}>Objective</Text>
                  <Text style={styles.lessonObjectiveText}>{currentLesson.objective}</Text>
                </View>

                <View style={styles.lessonDetailCard}>
                  <Text style={styles.keyPointsTitle}>Key Points</Text>
                  {currentLesson.keyPoints.map((point, index) => (
                    <View key={index} style={styles.keyPointItem}>
                      <View style={styles.bulletPoint} />
                      <Text style={styles.keyPointText}>{point}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.lessonDetailCard}>
                  <Text style={styles.practiceTitle}>Practice Exercise</Text>
                  <View style={styles.practiceHeader}>
                    <Ionicons name="time" size={16} color={theme.colors.primary} />
                    <Text style={styles.practiceTime}>{currentLesson.practice.duration}</Text>
                  </View>
                  <Text style={styles.practiceInstructions}>{currentLesson.practice.instructions}</Text>
                </View>

                <View style={styles.lessonActions}>
                  <TouchableOpacity style={styles.completeButton} onPress={closeLessonModal}>
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.textOnPrimary} />
                    <Text style={styles.completeButtonText}>Mark as Complete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerWelcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.bold,
  },
  signOutButton: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    ...theme.shadows.md,
  },
  signOutButtonText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.medium,
  },
  scrollView: {
    flex: 1,
  },
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    ...theme.shadows.md,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.bold,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    fontFamily: theme.typography.fontFamily.regular,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.bold,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  welcomeIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Bottom Navigation
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navButtonActive: {
    // No additional styling for active state - just color changes
  },
  navButtonText: {
    fontSize: 10,
    color: theme.colors.text,
    marginTop: 4,
    fontFamily: theme.typography.fontFamily.medium,
  },
  navButtonTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  
  // Featured Section
  featuredSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontFamily: theme.typography.fontFamily.bold,
  },
  featuredCard: {
    borderRadius: theme.radii.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    ...theme.shadows.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  featuredCardContent: {
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredVideoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: theme.radii.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: theme.spacing.md,
    ...theme.shadows.md,
  },
  featuredVideoIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  playButtonLarge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  featuredInfo: {
    flex: 1,
  },
  featuredVideoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textOnSecondary,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.bold,
  },
  featuredVideoDescription: {
    fontSize: 14,
    color: theme.colors.textOnSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
    fontFamily: theme.typography.fontFamily.regular,
  },
  featuredTags: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  featuredTag: {
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radii.sm,
  },
  featuredTagText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.medium,
  },
  
  // Media Container
  mediaContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  
  // Video Grid
  videoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  videoCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 3,
  },
  videoCardDisabled: {
    opacity: 0.7,
  },
  videoThumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: `${theme.colors.primary}08`,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  videoThumbnailDisabled: {
    opacity: 0.6,
  },
  videoThumbnailGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `${theme.colors.primary}10`,
  },
  videoThumbnailIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: theme.radii.lg,
    width: 50,
    height: 50,
    ...theme.shadows.sm,
    elevation: 2,
  },
  videoDurationBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radii.md,
  },
  videoDurationText: {
    fontSize: 10,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.bold,
  },
  videoPlayButtonOverlay: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    right: theme.spacing.sm,
  },
  videoPlayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
    elevation: 3,
  },
  videoLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoLoadingSpinner: {
    marginBottom: theme.spacing.xs,
  },
  videoLoadingText: {
    fontSize: 12,
    color: theme.colors.textOnPrimary,
    fontFamily: theme.typography.fontFamily.medium,
  },
  videoCardContent: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  videoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textOnSecondary,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.bold,
    lineHeight: 18,
  },
  videoCardDescription: {
    fontSize: 12,
    color: theme.colors.textOnSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    lineHeight: 16,
  },
  
  // Audio List
  audioList: {
    gap: theme.spacing.md,
  },
  audioItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  audioItemActive: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    ...theme.shadows.lg,
  },
  audioItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  audioIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    position: 'relative',
    ...theme.shadows.sm,
  },
  audioIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioPlayingIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  audioPlayingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  audioInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  audioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textOnSecondary,
    marginBottom: 4,
    fontFamily: theme.typography.fontFamily.medium,
  },
  audioDescription: {
    fontSize: 14,
    color: theme.colors.textOnSecondary,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.regular,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 20,
  },
  waveformBar: {
    width: 3,
    borderRadius: 1.5,
    minHeight: 4,
    backgroundColor: theme.colors.primary,
  },
  audioControls: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  audioPlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  audioPlayButtonIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioOptionsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  
  // Progress and Loading - Enhanced
  audioProgressContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  audioProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  audioProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  audioProgressTime: {
    fontSize: 12,
    color: theme.colors.textOnSecondary,
    minWidth: 60,
    fontFamily: theme.typography.fontFamily.regular,
  },
  
  // Enhanced Loading Indicators
  audioLoadingContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    alignItems: 'center',
  },
  audioLoadingBar: {
    width: '100%',
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  audioLoadingIndicator: {
    height: '100%',
    width: '100%',
    backgroundColor: theme.colors.secondary,
    borderRadius: 3,
    opacity: 0.8,
  },
  audioLoadingText: {
    fontSize: 14,
    color: theme.colors.textOnSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.regular,
  },
  
  // Video Loading with beautiful animation
  videoLoadingContainer: {
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  videoLoadingIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    ...theme.shadows.md,
  },
  videoLoadingBar: {
    width: 200,
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  videoLoadingIndicator: {
    height: '100%',
    width: '70%',
    backgroundColor: theme.colors.secondary,
    borderRadius: 4,
  },
  
  // Control Section
  controlSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.pill,
    ...theme.shadows.md,
  },
  stopButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  stopButtonText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.medium,
  },
  bottomSpacer: {
    height: theme.spacing.xl,
  },
  
  // Video Modal - Enhanced
  videoModalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  videoModalContent: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  videoCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    ...theme.shadows.sm,
  },
  videoHeaderInfo: {
    flex: 1,
  },
  videoHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
    fontFamily: theme.typography.fontFamily.bold,
  },
  videoHeaderDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    fontFamily: theme.typography.fontFamily.regular,
  },
  videoPlayerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  videoPlayer: {
    width: '100%',
    height: Math.min(height * 0.4, 300),
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.lg,
  },
  videoInfoContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  videoInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  videoInfoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.medium,
  },
  videoInfoValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.medium,
  },
  videoInstructions: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.regular,
  },
  
  // Disabled states for loading
  audioItemDisabled: {
    opacity: 0.6,
  },
  audioIconDisabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.border,
  },
  audioPlayButtonDisabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.border,
  },
  
  // Learn Section Styles
  learnContainer: {
    gap: theme.spacing.xl,
  },
  chapterCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  chapterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textOnSecondary,
    marginBottom: theme.spacing.lg,
    fontFamily: theme.typography.fontFamily.bold,
  },
  lessonsContainer: {
    gap: theme.spacing.md,
  },
  lessonCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  lessonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
  },
  lessonObjective: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
    fontFamily: theme.typography.fontFamily.regular,
  },
  practiceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  practiceDuration: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    fontFamily: theme.typography.fontFamily.medium,
  },
  
  // Lesson Modal Styles
  lessonModalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  lessonModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  lessonCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  lessonModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textOnSecondary,
    flex: 1,
    fontFamily: theme.typography.fontFamily.bold,
  },
  lessonModalContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  lessonDetailCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  lessonObjectiveTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textOnSecondary,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily.bold,
  },
  lessonObjectiveText: {
    fontSize: 14,
    color: theme.colors.textOnSecondary,
    lineHeight: 20,
    fontFamily: theme.typography.fontFamily.regular,
  },
  keyPointsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textOnSecondary,
    marginBottom: theme.spacing.md,
    fontFamily: theme.typography.fontFamily.bold,
  },
  keyPointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginTop: 8,
    marginRight: theme.spacing.sm,
  },
  keyPointText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textOnSecondary,
    lineHeight: 20,
    fontFamily: theme.typography.fontFamily.regular,
  },
  practiceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textOnSecondary,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily.bold,
  },
  practiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  practiceTime: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textOnSecondary,
    fontFamily: theme.typography.fontFamily.medium,
  },
  practiceInstructions: {
    fontSize: 14,
    color: theme.colors.textOnSecondary,
    lineHeight: 20,
    fontFamily: theme.typography.fontFamily.regular,
  },
  lessonActions: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.lg,
    gap: theme.spacing.sm,
    ...theme.shadows.md,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textOnPrimary,
    fontFamily: theme.typography.fontFamily.medium,
  },
});
