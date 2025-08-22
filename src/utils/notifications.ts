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

export type NotificationType = 
  | 'research-checkin'
  | 'daily-checkin'
  | 'motivation'
  | 'pss4'
  | 'cope'
  | 'who5';

const NOTIFICATION_CONTENT = {
  'research-checkin': {
    title: 'Research Check-in Due',
    body: 'Time for your weekly research survey. Your input helps us understand nurse well-being.',
  },
  'daily-checkin': {
    title: 'How are you today?',
    body: 'Take a moment to check in with yourself.',
  },
  'motivation': {
    title: 'Daily Inspiration',
    body: 'Your compassion makes a difference every day.',
  },
  'pss4': {
    title: 'Stress Assessment Due',
    body: 'Time to complete your PSS-4 survey.',
  },
  'cope': {
    title: 'Coping Strategies Check',
    body: 'Time to complete your Brief COPE survey.',
  },
  'who5': {
    title: 'Well-being Check Due',
    body: 'Time to complete your WHO-5 survey.',
  },
};

const MOTIVATIONAL_QUOTES = [
  "Your compassion makes a difference every day.",
  "Small acts of kindness create big ripples.",
  "You bring hope and healing to others.",
  "Your strength inspires those around you.",
  "Today's challenges build tomorrow's expertise.",
  "You make the impossible possible.",
  "Your dedication changes lives.",
  "Every day you make a difference.",
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

export const scheduleResearchCheckIn = async (type: 'pss4' | 'cope' | 'who5', intervalDays: number) => {
  const nextDate = getNextTriggerDate(9); // 9 AM
  nextDate.setDate(nextDate.getDate() + intervalDays - 1);

  const seconds = Math.floor((nextDate.getTime() - Date.now()) / 1000);
  if (seconds > 0) {
    await Notifications.scheduleNotificationAsync({
      content: NOTIFICATION_CONTENT[type],
      trigger: {
        seconds,
      } as Notifications.NotificationTriggerInput,
    });
  }
};

export const scheduleDailyCheckInReminder = async () => {
  const nextTime = getNextTriggerDate(10); // 10 AM

  // Schedule for the next 30 days since Android doesn't support indefinite repeating
  const notifications = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(nextTime);
    date.setDate(date.getDate() + i);
    const seconds = Math.floor((date.getTime() - Date.now()) / 1000);
    
    if (seconds > 0) {
      return Notifications.scheduleNotificationAsync({
        content: NOTIFICATION_CONTENT['daily-checkin'],
        trigger: {
          seconds,
        } as Notifications.NotificationTriggerInput,
      });
    }
    return Promise.resolve();
  });

  await Promise.all(notifications.filter(Boolean));
  return 'daily-checkin';
};

export const scheduleMotivationalQuote = async () => {
  const quoteIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  const nextTime = getNextTriggerDate(8); // 8 AM
  
  // Schedule for the next 30 days since Android doesn't support indefinite repeating
  const notifications = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(nextTime);
    date.setDate(date.getDate() + i);
    const seconds = Math.floor((date.getTime() - Date.now()) / 1000);

    if (seconds > 0) {
      return Notifications.scheduleNotificationAsync({
        content: {
          ...NOTIFICATION_CONTENT['motivation'],
          body: MOTIVATIONAL_QUOTES[(quoteIndex + i) % MOTIVATIONAL_QUOTES.length],
        },
        trigger: {
          seconds,
        } as Notifications.NotificationTriggerInput,
      });
    }
    return Promise.resolve();
  });

  await Promise.all(notifications.filter(Boolean));
  return 'motivation';
// Removed stray closing braces
};

export const setupAllNotifications = async () => {
  const hasPermission = await setupNotifications();
  if (!hasPermission) return;

  // Cancel any existing notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Schedule research check-ins
  await scheduleResearchCheckIn('pss4', 7); // PSS-4 every 7 days
  await scheduleResearchCheckIn('cope', 7); // COPE every 7 days
  await scheduleResearchCheckIn('who5', 14); // WHO-5 every 14 days

  // Schedule daily reminders
  await scheduleDailyCheckInReminder();
  await scheduleMotivationalQuote();
};

export const clearAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
