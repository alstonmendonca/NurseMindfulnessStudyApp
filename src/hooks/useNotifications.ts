import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useParticipant } from '../contexts/ParticipantContext';

export const useNotifications = () => {
  const { studyGroup } = useParticipant();

  useEffect(() => {
    const setupNotifications = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.HIGH,
        });
      }

      // Schedule research check-ins
      const checkInId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time for your research check-in',
          body: 'Please complete your weekly surveys to help us understand nurse well-being.',
          data: { type: 'research-checkin' },
        },
        trigger: null, // Will be managed by the app logic
      });

      // Schedule daily check-in reminder
      const dailyId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'How are you today?',
          body: 'Take a moment to check in with yourself.',
          data: { type: 'daily-checkin' },
        },
        trigger: null, // Will be managed by the app logic
      });

      // Only for intervention group
      if (studyGroup === 'intervention') {
        const motivationalId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Daily Inspiration',
            body: 'Remember: Your compassion makes a difference every day.',
            data: { type: 'motivation' },
          },
          trigger: null, // Will be managed by the app logic
        });

        return () => {
          Notifications.cancelScheduledNotificationAsync(motivationalId);
        };
      }

      return () => {
        Notifications.cancelScheduledNotificationAsync(checkInId);
        Notifications.cancelScheduledNotificationAsync(dailyId);
      };
    };

    setupNotifications();
  }, [studyGroup]);

  const scheduleNextNotification = async (type: string) => {
    const content = {
      title: '',
      body: '',
      data: { type },
    };

    switch (type) {
      case 'research-checkin':
        content.title = 'Research Check-in Due';
        content.body = 'Time for your weekly surveys.';
        break;
      case 'daily-checkin':
        content.title = 'Daily Check-in';
        content.body = 'How are you feeling today?';
        break;
      case 'motivation':
        content.title = 'Daily Inspiration';
        content.body = 'Your dedication makes a difference.';
        break;
    }

    await Notifications.scheduleNotificationAsync({
      content,
      trigger: null, // Immediate notification
    });
  };

  return {
    scheduleNextNotification,
  };
};
