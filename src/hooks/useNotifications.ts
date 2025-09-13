import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { setupAllNotifications } from '../utils/notifications';

const CALMING_MESSAGES = [
  'Feeling stressed? Listen to some calming sounds',
  'Take a break and enjoy some peaceful nature sounds',
  'Your mind deserves rest. Try our soothing audio collection',
  'Overwhelmed? Let calming sounds restore your peace',
  'Time for tranquility. Explore our relaxing soundscapes',
  'Stress relief is just a tap away. Listen to calming sounds',
  'Give yourself the gift of calm with our peaceful audio',
  'Feeling tense? Unwind with some gentle, soothing sounds',
  'Your well-being matters. Take a moment for calming sounds',
  'Need a mental reset? Our relaxing sounds are here to help',
];

export const useNotifications = () => {
  useEffect(() => {
    // Set up the single daily calming reminder
    setupAllNotifications();
  }, []);

  const scheduleNextNotification = async () => {
    // Get a random calming message
    const randomMessage = CALMING_MESSAGES[Math.floor(Math.random() * CALMING_MESSAGES.length)];
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Take a Moment',
        body: randomMessage,
        data: { type: 'calming-reminder' },
      },
      trigger: null, // Immediate notification
    });
  };

  return {
    scheduleNextNotification,
  };
};
