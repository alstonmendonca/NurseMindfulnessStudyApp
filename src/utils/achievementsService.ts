import { supabase } from './supabase';

export interface UsageStats {
  totalDays: number;
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  unlocked: boolean;
  stars: number;
  requirement: number;
  type: 'time' | 'streak' | 'sessions';
}

const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked' | 'stars'>[] = [
  { id: '1', title: 'First Steps', icon: '🎓', requirement: 1, type: 'sessions' },
  { id: '2', title: '5 Minutes', icon: '⏱️', requirement: 5, type: 'time' },
  { id: '3', title: '10 Minutes', icon: '📖', requirement: 10, type: 'time' },
  { id: '4', title: '15 Minutes', icon: '📚', requirement: 15, type: 'time' },
  { id: '5', title: '30 Minutes', icon: '🌀', requirement: 30, type: 'time' },
  { id: '6', title: '1 Hour', icon: '⏰', requirement: 60, type: 'time' },
  { id: '7', title: '3 Day Streak', icon: '🔗', requirement: 3, type: 'streak' },
  { id: '8', title: '7 Day Streak', icon: '🔥', requirement: 7, type: 'streak' },
  { id: '9', title: '2 Week Streak', icon: '⚡', requirement: 14, type: 'streak' },
  { id: '10', title: '30 Day Streak', icon: '🦄', requirement: 30, type: 'streak' },
  { id: '11', title: 'Daily Warrior', icon: '🏃', requirement: 10, type: 'sessions' },
  { id: '12', title: 'Zen Master', icon: '🧘', requirement: 50, type: 'sessions' },
];

export class AchievementsService {
  /**
   * Fetch usage statistics for a participant
   */
  static async getUsageStats(participantNumber: number): Promise<UsageStats> {
    try {
      // Fetch all sessions for the participant
      const { data: sessions, error } = await supabase
        .from('app_usage_sessions')
        .select('session_start, session_end, duration_minutes')
        .eq('participant_number', participantNumber)
        .order('session_start', { ascending: true });

      if (error) {
        console.error('Error fetching usage stats:', error);
        return this.getDefaultStats();
      }

      if (!sessions || sessions.length === 0) {
        return this.getDefaultStats();
      }

      // Calculate total sessions
      const totalSessions = sessions.length;

      // Calculate total minutes
      const totalMinutes = sessions.reduce((sum, session) => {
        return sum + (session.duration_minutes || 0);
      }, 0);

      // Calculate unique days
      const uniqueDays = new Set(
        sessions.map(session => {
          const date = new Date(session.session_start);
          return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        })
      );
      const totalDays = uniqueDays.size;

      // Calculate streaks
      const { currentStreak, longestStreak } = this.calculateStreaks(sessions);

      return {
        totalDays,
        totalSessions,
        totalMinutes,
        currentStreak,
        longestStreak,
      };
    } catch (error) {
      console.error('Error in getUsageStats:', error);
      return this.getDefaultStats();
    }
  }

  /**
   * Calculate current and longest streaks
   */
  private static calculateStreaks(sessions: any[]): { currentStreak: number; longestStreak: number } {
    if (sessions.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Get unique days sorted
    const uniqueDays = Array.from(
      new Set(
        sessions.map(session => {
          const date = new Date(session.session_start);
          return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        })
      )
    ).sort((a, b) => a - b);

    let currentStreak = 1;
    let longestStreak = 1;
    let tempStreak = 1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const oneDayMs = 24 * 60 * 60 * 1000;

    // Calculate longest streak
    for (let i = 1; i < uniqueDays.length; i++) {
      const diff = uniqueDays[i] - uniqueDays[i - 1];
      if (diff === oneDayMs) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    // Calculate current streak (must include today or yesterday)
    const lastSessionTime = uniqueDays[uniqueDays.length - 1];
    const daysSinceLastSession = Math.floor((todayTime - lastSessionTime) / oneDayMs);

    if (daysSinceLastSession <= 1) {
      currentStreak = 1;
      for (let i = uniqueDays.length - 2; i >= 0; i--) {
        const diff = uniqueDays[i + 1] - uniqueDays[i];
        if (diff === oneDayMs) {
          currentStreak++;
        } else {
          break;
        }
      }
    } else {
      currentStreak = 0;
    }

    return { currentStreak, longestStreak };
  }

  /**
   * Get achievements based on usage stats
   */
  static async getAchievements(participantNumber: number): Promise<Achievement[]> {
    const stats = await this.getUsageStats(participantNumber);

    return ACHIEVEMENT_DEFINITIONS.map(def => {
      let unlocked = false;
      let stars = 0;

      switch (def.type) {
        case 'time':
          unlocked = stats.totalMinutes >= def.requirement;
          break;
        case 'streak':
          unlocked = stats.longestStreak >= def.requirement;
          break;
        case 'sessions':
          unlocked = stats.totalSessions >= def.requirement;
          break;
      }

      // Determine stars based on progress (3 stars if fully unlocked)
      if (unlocked) {
        stars = 3;
      } else {
        // Calculate partial progress
        let progress = 0;
        switch (def.type) {
          case 'time':
            progress = stats.totalMinutes / def.requirement;
            break;
          case 'streak':
            progress = stats.longestStreak / def.requirement;
            break;
          case 'sessions':
            progress = stats.totalSessions / def.requirement;
            break;
        }
        if (progress >= 0.66) stars = 2;
        else if (progress >= 0.33) stars = 1;
      }

      return {
        ...def,
        unlocked,
        stars,
      };
    });
  }

  /**
   * Get default stats when no data is available
   */
  private static getDefaultStats(): UsageStats {
    return {
      totalDays: 0,
      totalSessions: 0,
      totalMinutes: 0,
      currentStreak: 0,
      longestStreak: 0,
    };
  }
}
