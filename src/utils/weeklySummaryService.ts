import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { getCompletedCourses } from './courseCompletionService';

const LAST_SUMMARY_DATE_KEY = '@weekly_summary_last_shown';
const WEEKLY_SUMMARY_DATA_KEY = '@weekly_summary_data';

export interface WeeklySummary {
  sessionsThisWeek: number;
  minutesThisWeek: number;
  coursesCompletedThisWeek: number;
  currentStreak: number;
  weekStartDate: string;
  weekEndDate: string;
}

export class WeeklySummaryService {
  /**
   * Check if it's time to show the weekly summary (every 7 days)
   */
  static async shouldShowWeeklySummary(): Promise<boolean> {
    try {
      const lastShown = await AsyncStorage.getItem(LAST_SUMMARY_DATE_KEY);
      
      if (!lastShown) {
        // Never shown before — show after at least 1 day of usage
        return false;
      }

      const lastDate = new Date(lastShown);
      const now = new Date();
      const daysSinceLastShown = Math.floor(
        (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return daysSinceLastShown >= 7;
    } catch (error) {
      console.error('Error checking weekly summary:', error);
      return false;
    }
  }

  /**
   * Initialize the weekly summary tracking (call on first app open)
   */
  static async initializeIfNeeded(): Promise<void> {
    try {
      const lastShown = await AsyncStorage.getItem(LAST_SUMMARY_DATE_KEY);
      if (!lastShown) {
        // Set today as the starting point so summary shows in 7 days
        await AsyncStorage.setItem(LAST_SUMMARY_DATE_KEY, new Date().toISOString());
      }
    } catch (error) {
      console.error('Error initializing weekly summary:', error);
    }
  }

  /**
   * Mark the weekly summary as shown
   */
  static async markAsShown(): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_SUMMARY_DATE_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Error marking weekly summary as shown:', error);
    }
  }

  /**
   * Get the weekly summary data for a participant
   */
  static async getWeeklySummary(participantNumber: number): Promise<WeeklySummary> {
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const weekStartDate = weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const weekEndDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Fetch sessions from the past 7 days
      const { data: sessions, error } = await supabase
        .from('app_usage_sessions')
        .select('session_start, session_end, duration_minutes')
        .eq('participant_number', participantNumber)
        .gte('session_start', weekAgo.toISOString())
        .order('session_start', { ascending: true });

      if (error) {
        console.error('Error fetching weekly sessions:', error);
      }

      const sessionsThisWeek = sessions?.length || 0;
      const minutesThisWeek = sessions?.reduce(
        (sum, s) => sum + (s.duration_minutes || 0), 0
      ) || 0;

      // Count courses completed this week
      const completedCourses = await getCompletedCourses();
      const coursesCompletedThisWeek = completedCourses.filter(c => {
        const completedDate = new Date(c.completedAt);
        return completedDate >= weekAgo && completedDate <= now;
      }).length;

      // Calculate current streak from all sessions
      let currentStreak = 0;
      if (sessions && sessions.length > 0) {
        const { data: allSessions } = await supabase
          .from('app_usage_sessions')
          .select('session_start')
          .eq('participant_number', participantNumber)
          .order('session_start', { ascending: true });

        if (allSessions && allSessions.length > 0) {
          const uniqueDays = Array.from(
            new Set(
              allSessions.map(s => {
                const d = new Date(s.session_start);
                return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
              })
            )
          ).sort((a, b) => a - b);

          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayTime = today.getTime();
          const oneDayMs = 24 * 60 * 60 * 1000;

          const lastDay = uniqueDays[uniqueDays.length - 1];
          const daysSinceLast = Math.floor((todayTime - lastDay) / oneDayMs);

          if (daysSinceLast <= 1) {
            currentStreak = 1;
            for (let i = uniqueDays.length - 2; i >= 0; i--) {
              if (uniqueDays[i + 1] - uniqueDays[i] === oneDayMs) {
                currentStreak++;
              } else {
                break;
              }
            }
          }
        }
      }

      return {
        sessionsThisWeek,
        minutesThisWeek: Math.round(minutesThisWeek),
        coursesCompletedThisWeek,
        currentStreak,
        weekStartDate,
        weekEndDate,
      };
    } catch (error) {
      console.error('Error getting weekly summary:', error);
      return {
        sessionsThisWeek: 0,
        minutesThisWeek: 0,
        coursesCompletedThisWeek: 0,
        currentStreak: 0,
        weekStartDate: '',
        weekEndDate: '',
      };
    }
  }
}
