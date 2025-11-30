import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVITIES_KEY = '@daily_activities';
const LAST_RESET_KEY = '@activities_last_reset';

export interface DailyActivity {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export class DailyActivitiesService {
  /**
   * Check if we need to reset activities for a new day
   */
  private static async checkAndResetIfNewDay(): Promise<void> {
    try {
      const lastResetStr = await AsyncStorage.getItem(LAST_RESET_KEY);
      const today = this.getTodayDateString();

      if (lastResetStr !== today) {
        // New day - reset all activities
        await this.resetActivities();
        await AsyncStorage.setItem(LAST_RESET_KEY, today);
      }
    } catch (error) {
      console.error('Error checking/resetting daily activities:', error);
    }
  }

  /**
   * Get today's date as a string (YYYY-MM-DD)
   */
  private static getTodayDateString(): string {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }

  /**
   * Reset all activities (uncheck all)
   */
  private static async resetActivities(): Promise<void> {
    try {
      console.log('Resetting activities for new day');
      const activitiesStr = await AsyncStorage.getItem(ACTIVITIES_KEY);
      
      if (activitiesStr) {
        const activities = JSON.parse(activitiesStr);
        const resetActivities = activities.map((activity: DailyActivity) => ({
          ...activity,
          completed: false,
        }));
        await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(resetActivities));
        console.log('Activities reset successfully for new day');
      }
    } catch (error) {
      console.error('Error resetting activities:', error);
    }
  }

  /**
   * Get all activities for today
   */
  static async getActivities(): Promise<DailyActivity[]> {
    try {
      // Check if we need to reset for new day
      await this.checkAndResetIfNewDay();

      const activitiesStr = await AsyncStorage.getItem(ACTIVITIES_KEY);
      if (!activitiesStr) {
        // Initialize with default activities if none exist
        const defaultActivities: DailyActivity[] = [
          {
            id: `default-1-${Date.now()}`,
            text: 'Take 3 slow breaths',
            completed: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: `default-2-${Date.now()}`,
            text: 'Drink a glass of water',
            completed: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: `default-3-${Date.now()}`,
            text: 'Stretch for 2 minutes',
            completed: false,
            createdAt: new Date().toISOString(),
          },
        ];
        await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(defaultActivities));
        return defaultActivities;
      }
      return JSON.parse(activitiesStr);
    } catch (error) {
      console.error('Error getting activities:', error);
      return [];
    }
  }

  /**
   * Add a new activity
   */
  static async addActivity(text: string): Promise<DailyActivity[]> {
    try {
      console.log('DailyActivitiesService: Adding activity:', text);
      
      // Get current activities (bypassing the daily reset check for add operation)
      const activitiesStr = await AsyncStorage.getItem(ACTIVITIES_KEY);
      let activities: DailyActivity[] = [];
      
      if (activitiesStr) {
        activities = JSON.parse(activitiesStr);
      }
      
      console.log('DailyActivitiesService: Current activities:', activities.length);
      
      const newActivity: DailyActivity = {
        id: `activity-${Date.now()}`,
        text,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      
      const updatedActivities = [...activities, newActivity];
      
      // Save to local storage
      const jsonString = JSON.stringify(updatedActivities);
      await AsyncStorage.setItem(ACTIVITIES_KEY, jsonString);
      
      console.log('DailyActivitiesService: Activity saved successfully, new count:', updatedActivities.length);
      console.log('DailyActivitiesService: Saved data:', jsonString);
      
      return updatedActivities;
    } catch (error) {
      console.error('Error adding activity:', error);
      throw error;
    }
  }

  /**
   * Toggle activity completion status
   */
  static async toggleActivity(id: string): Promise<DailyActivity[]> {
    try {
      console.log('Toggling activity:', id);
      
      // Get current activities without reset check
      const activitiesStr = await AsyncStorage.getItem(ACTIVITIES_KEY);
      let activities: DailyActivity[] = [];
      
      if (activitiesStr) {
        activities = JSON.parse(activitiesStr);
      }
      
      const updatedActivities = activities.map(activity =>
        activity.id === id
          ? { ...activity, completed: !activity.completed }
          : activity
      );
      
      await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updatedActivities));
      console.log('Activity toggled successfully');
      
      return updatedActivities;
    } catch (error) {
      console.error('Error toggling activity:', error);
      throw error;
    }
  }

  /**
   * Delete an activity
   */
  static async deleteActivity(id: string): Promise<DailyActivity[]> {
    try {
      const activities = await this.getActivities();
      const updatedActivities = activities.filter(activity => activity.id !== id);
      await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updatedActivities));
      return updatedActivities;
    } catch (error) {
      console.error('Error deleting activity:', error);
      return await this.getActivities();
    }
  }

  /**
   * Update activity text
   */
  static async updateActivity(id: string, text: string): Promise<DailyActivity[]> {
    try {
      const activities = await this.getActivities();
      const updatedActivities = activities.map(activity =>
        activity.id === id ? { ...activity, text } : activity
      );
      await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updatedActivities));
      return updatedActivities;
    } catch (error) {
      console.error('Error updating activity:', error);
      return await this.getActivities();
    }
  }
}
