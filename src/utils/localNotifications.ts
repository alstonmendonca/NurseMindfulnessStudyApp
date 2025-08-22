import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure local notifications behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,  // Shows notification as banner when app is in foreground
    shouldShowList: true,    // Shows notification in notification list/drawer
    shouldPlaySound: true,   // Play notification sound
    shouldSetBadge: false,   // Don't show app badge count
  }),
});

export type NotificationType = 
  | 'daily-checkin'
  | 'mood-check'
  | 'meditation'
  | 'breathing'
  | 'motivation';

const NOTIFICATION_CONTENT = {
  'daily-checkin': {
    title: 'How are you today?',
    body: 'Take a moment to check in with yourself.',
  },
  'mood-check': {
    title: 'Mood Check',
    body: "Let's check how you're feeling.",
  },
  'meditation': {
    title: 'Meditation Time',
    body: 'Take a moment to meditate and find your center.',
  },
  'breathing': {
    title: 'Breathing Exercise',
    body: 'Time for a quick breathing exercise.',
  },
  'motivation': {
    title: 'Daily Inspiration',
    body: 'Remember your strength and resilience.',
  },
};

const MOTIVATIONAL_QUOTES = [
  'Your compassion makes a difference every day.',
  'Take care of yourself as well as you take care of others.',
  'You have the strength to handle today.',
  'Small steps lead to big changes.',
  'Your well-being matters.',
];

export async function scheduleLocalNotification(
  type: NotificationType,
  triggerInput?: {
    date?: Date;
    repeatInterval?: number;
  }
) {
  const content = NOTIFICATION_CONTENT[type];
  
  if (type === 'motivation') {
    content.body = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  }

  const notificationContent = {
    title: content.title,
    body: content.body,
    sound: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  };

  let trigger: any = null;

  if (triggerInput?.date) {
    const seconds = Math.max(1, Math.floor((triggerInput.date.getTime() - Date.now()) / 1000));
    trigger = { seconds };
  } else if (triggerInput?.repeatInterval) {
    trigger = { 
      seconds: triggerInput.repeatInterval,
      repeats: true 
    };
  }

  await Notifications.scheduleNotificationAsync({
    content: notificationContent,
    trigger,
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: content.title,
      body: content.body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger,
  });
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function requestNotificationPermissions() {
  let permissionStatus = await Notifications.getPermissionsAsync();
  
  if (permissionStatus.status !== 'granted') {
    permissionStatus = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: true,
      },
    });
  }

  return permissionStatus.status === 'granted';
}

// Schedule a daily check-in notification
export async function scheduleDailyCheckIn(hour: number, minute: number) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  
  // If the time has passed for today, schedule for tomorrow
  if (date < new Date()) {
    date.setDate(date.getDate() + 1);
  }

  await scheduleLocalNotification('daily-checkin', { 
    date,
    repeatInterval: 24 * 60 * 60 // 24 hours in seconds
  });
}

// Schedule random motivational quotes throughout the day
export async function scheduleMotivationalQuotes(frequency: number) {
  const now = new Date();
  const hours = Array.from({ length: frequency }, (_, i) => 
    Math.floor(9 + (i * (12 / frequency)))  // Spread between 9 AM and 9 PM
  );

  for (const hour of hours) {
    const date = new Date();
    date.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
    
    // If the time has passed for today, schedule for tomorrow
    if (date < now) {
      date.setDate(date.getDate() + 1);
    }

    await scheduleLocalNotification('motivation', { 
      date,
      repeatInterval: 24 * 60 * 60 // 24 hours in seconds
    });
  }
}

// Schedule a one-time notification
export async function scheduleOneTimeNotification(
  type: NotificationType,
  secondsFromNow: number
) {
  const date = new Date(Date.now() + secondsFromNow * 1000);
  await scheduleLocalNotification(type, { date });
}
