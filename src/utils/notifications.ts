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

export type NotificationType = 'daily-reminder';

// Single daily notification message
const NOTIFICATION_MESSAGE = {
  title: 'SHANTHI',
  body: 'Time to use the SHANTHI App for relaxation',
};

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

export const scheduleDailyCalmingReminder = async () => {
  // Cancel any existing notifications first to ensure only one is scheduled
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  // Schedule a daily repeating notification at 12:00 PM (noon)
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: NOTIFICATION_MESSAGE.title,
      body: NOTIFICATION_MESSAGE.body,
      sound: true,
      data: { 
        type: 'daily-reminder',
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 12,
      minute: 0,
    },
  });

  console.log(`✅ Scheduled daily notification at 12:00 PM (ID: ${notificationId})`);
  
  return {
    notificationId,
    message: 'Daily notification scheduled for 12:00 PM'
  };
};

// Function to check if we already have a notification scheduled
export const checkIfNotificationAlreadyScheduled = async () => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  console.log(`📅 Total scheduled notifications: ${scheduled.length}`);
  return scheduled.length > 0;
};

export const setupAllNotifications = async () => {
  const hasPermission = await setupNotifications();
  if (!hasPermission) {
    console.log('❌ Notification permissions not granted');
    return;
  }

  // Schedule the daily notification at 12:00 PM
  // This will cancel any existing notifications and create a new one
  await scheduleDailyCalmingReminder();
  
  // Show current schedule for debugging
  await getScheduledNotifications();
};

export const clearAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

// Debug function to check currently scheduled notifications
export const getScheduledNotifications = async () => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  console.log(`📅 Total scheduled notifications: ${scheduled.length}`);
  
  if (scheduled.length > 0) {
    console.log('📝 Scheduled notifications:');
    scheduled.forEach((notification, index) => {
      const trigger = notification.trigger as any;
      if (trigger.type === 'daily') {
        console.log(`   ${index + 1}. Daily at ${trigger.hour}:${String(trigger.minute).padStart(2, '0')}`);
      } else if (trigger.seconds) {
        const triggerDate = new Date(Date.now() + trigger.seconds * 1000);
        console.log(`   ${index + 1}. ${triggerDate.toLocaleDateString()} at ${triggerDate.toLocaleTimeString()}`);
      } else {
        console.log(`   ${index + 1}. Unknown trigger type`);
      }
    });
  } else {
    console.log('⚠️ No notifications currently scheduled');
  }
  
  return scheduled;
};
