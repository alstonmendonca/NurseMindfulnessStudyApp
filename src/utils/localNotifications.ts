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

export async function scheduleLocalNotification(
  type: NotificationType,
  triggerInput?: {
    date?: Date;
    repeatInterval?: number;
  }
) {
  const content = NOTIFICATION_CONTENT[type];
  
  if (type === 'calming-reminder') {
    content.body = CALMING_MESSAGES[Math.floor(Math.random() * CALMING_MESSAGES.length)];
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

// Schedule a daily calming reminder at 12 PM
export async function scheduleDailyCalmingReminder() {
  const date = new Date();
  date.setHours(12, 0, 0, 0); // Set to 12:00 PM
  
  // If 12 PM has passed for today, schedule for tomorrow
  if (date < new Date()) {
    date.setDate(date.getDate() + 1);
  }

  await scheduleLocalNotification('calming-reminder', { 
    date,
    repeatInterval: 24 * 60 * 60 // 24 hours in seconds
  });
}

// Schedule a one-time notification
export async function scheduleOneTimeNotification(
  type: NotificationType,
  secondsFromNow: number
) {
  const date = new Date(Date.now() + secondsFromNow * 1000);
  await scheduleLocalNotification(type, { date });
}
