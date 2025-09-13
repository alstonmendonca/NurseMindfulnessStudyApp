import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notifications behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,  // Shows notification as banner when app is in foreground
    shouldShowList: true,    // Shows notification in notification list/drawer
    shouldPlaySound: true,   // Play notification sound
    shouldSetBadge: false,   // Don't show app badge count
  }),
});

export type NotificationType = 'calming-reminder';

const NOTIFICATION_CONTENT = {
  'calming-reminder': {
    title: 'Take a Moment',
    body: 'Feeling stressed? Listen to some calming sounds',
  },
};

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

export const setupNotifications = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4A90E2',
    });
  }

  return true;
};

// Utility function to calculate next time from hours and minutes
const getNextTriggerDate = (targetHour: number, targetMinute: number = 0): Date => {
  const now = new Date();
  const next = new Date(now);
  next.setHours(targetHour, targetMinute, 0, 0);
  
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  
  return next;
};

export const scheduleDailyCalmingReminder = async () => {
  const nextTime = getNextTriggerDate(12); // 12 PM

  // Schedule for the next 30 days since Android doesn't support indefinite repeating
  const notifications = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(nextTime);
    date.setDate(date.getDate() + i);
    const seconds = Math.floor((date.getTime() - Date.now()) / 1000);
    
    if (seconds > 0) {
      // Randomize the message for each day
      const randomMessage = CALMING_MESSAGES[Math.floor(Math.random() * CALMING_MESSAGES.length)];
      
      return Notifications.scheduleNotificationAsync({
        content: {
          ...NOTIFICATION_CONTENT['calming-reminder'],
          body: randomMessage,
        },
        trigger: {
          seconds,
        } as Notifications.NotificationTriggerInput,
      });
    }
    return Promise.resolve();
  });

  await Promise.all(notifications.filter(Boolean));
  return 'calming-reminder';
};

export const setupAllNotifications = async () => {
  const hasPermission = await setupNotifications();
  if (!hasPermission) return;

  // Cancel any existing notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Schedule daily calming reminder at 12 PM
  await scheduleDailyCalmingReminder();
};

export const clearAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
