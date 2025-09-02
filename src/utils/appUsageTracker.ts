import { supabase } from './supabase';
import { AppState, AppStateStatus } from 'react-native';
import { networkManager, SessionDataBuffer, ConnectivityState } from './networkManager';

export interface AppUsageSession {
  id?: number;
  participant_number: number;
  session_start: string;
  session_end?: string;
  duration_minutes?: number;
  app_version?: string;
  created_at?: string;
}

class AppUsageTracker {
  private currentSessionId: number | null = null;
  private sessionStartTime: Date | null = null;
  private participantNumber: number | null = null;
  private appStateSubscription: any = null;
  private currentAppState: AppStateStatus = 'active';
  private sessionTimeoutId: NodeJS.Timeout | null = null;
  private isOnline: boolean = false;
  private networkListener: ((state: ConnectivityState) => void) | null = null;

  // Initialize tracking for a participant
  async initializeTracking(participantNumber: number): Promise<void> {
    this.participantNumber = participantNumber;
    this.currentAppState = AppState.currentState;
    
    // Initialize network monitoring
    await this.initializeNetworkMonitoring();
    
    // Clean up any orphaned sessions on app start
    await this.cleanupOrphanedSessions();
    
    // Sync any buffered data if online
    if (this.isOnline) {
      await this.syncBufferedData();
    }
    
    this.startAppStateListener();
    
    // Only start session if app is currently active
    if (this.currentAppState === 'active') {
      await this.startSession();
    }
  }

  // Sync any buffered data when back online
  private async syncBufferedData(): Promise<void> {
    if (!this.isOnline) return;

    try {
      await SessionDataBuffer.syncToDatabase();
      console.log('Successfully synced buffered app usage data');
    } catch (error) {
      console.error('Error syncing buffered data:', error);
    }
  }

  // Handle online state change
  private handleOnlineStateChange(isOnline: boolean): void {
    const wasOnline = this.isOnline;
    this.isOnline = isOnline;

    if (isOnline && !wasOnline) {
      // Just came back online - sync buffered data
      this.syncBufferedData();
    }
  }

  // Initialize network monitoring
  private async initializeNetworkMonitoring(): Promise<void> {
    const currentState = await networkManager.initialize();
    this.isOnline = networkManager.hasInternetConnection();
    
    this.networkListener = (state: ConnectivityState) => {
      const wasOnline = this.isOnline;
      this.isOnline = networkManager.hasInternetConnection();
      
      console.log('Network state changed. Online:', this.isOnline);
      
      // If we just came back online, sync buffered data
      if (!wasOnline && this.isOnline) {
        this.syncBufferedData();
      }
    };
    
    networkManager.addConnectivityListener(this.networkListener);
  }

  // Clean up sessions that didn't end properly (app was force closed, etc.)
  private async cleanupOrphanedSessions(): Promise<void> {
    if (!this.participantNumber) return;

    try {
      // Find sessions that don't have an end time and are older than 1 hour
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const { data: orphanedSessions, error: selectError } = await supabase
        .from('app_usage_sessions')
        .select('id, session_start')
        .eq('participant_number', this.participantNumber)
        .is('session_end', null)
        .lt('session_start', oneHourAgo.toISOString());

      if (selectError) {
        console.error('Error finding orphaned sessions:', selectError);
        return;
      }

      if (orphanedSessions && orphanedSessions.length > 0) {
        console.log(`Found ${orphanedSessions.length} orphaned sessions to clean up`);

        // Update orphaned sessions with estimated end times
        for (const session of orphanedSessions) {
          const sessionStart = new Date(session.session_start);
          // Estimate session ended 30 minutes after it started (reasonable default)
          const estimatedEnd = new Date(sessionStart.getTime() + 30 * 60 * 1000);
          const estimatedDuration = 30; // minutes

          await supabase
            .from('app_usage_sessions')
            .update({
              session_end: estimatedEnd.toISOString(),
              duration_minutes: estimatedDuration,
            })
            .eq('id', session.id);
        }

        console.log('Orphaned sessions cleaned up successfully');
      }
    } catch (error) {
      console.error('Error in cleanupOrphanedSessions:', error);
    }
  }

  // Stop tracking (when user logs out)
  async stopTracking(): Promise<void> {
    await this.endSession();
    this.stopAppStateListener();
    this.clearSessionTimeout();
    
    // Clean up network monitoring
    if (this.networkListener) {
      networkManager.removeConnectivityListener(this.networkListener);
      this.networkListener = null;
    }
    
    this.participantNumber = null;
  }

  // Start a new session
  private async startSession(): Promise<void> {
    if (!this.participantNumber || this.currentSessionId) return;

    try {
      this.sessionStartTime = new Date();
      
      if (this.isOnline) {
        // Try to create session in database
        const { data, error } = await supabase
          .from('app_usage_sessions')
          .insert([
            {
              participant_number: this.participantNumber,
              session_start: this.sessionStartTime.toISOString(),
              app_version: '1.0.0',
            }
          ])
          .select('id')
          .single();

        if (error) {
          console.error('Error starting app usage session:', error);
          // Fall back to offline mode
          await this.startSessionOffline();
          return;
        }

        this.currentSessionId = data.id;
        console.log('App usage session started online:', this.currentSessionId);
      } else {
        // Start session in offline mode
        await this.startSessionOffline();
      }
      
      // Set up timeout regardless of online/offline status
      this.setSessionTimeout();
    } catch (error) {
      console.error('Error in startSession:', error);
      // Fall back to offline mode
      await this.startSessionOffline();
    }
  }

  // Start session in offline mode
  private async startSessionOffline(): Promise<void> {
    if (!this.participantNumber || !this.sessionStartTime) return;

    // Generate a temporary session ID for offline tracking
    this.currentSessionId = Date.now(); // Use timestamp as temp ID
    
    // Buffer the session start
    await SessionDataBuffer.bufferSessionData({
      participant_number: this.participantNumber,
      session_start: this.sessionStartTime.toISOString(),
      app_version: '1.0.0',
      action: 'start',
      session_id: this.currentSessionId,
    });

    console.log('App usage session started offline with temp ID:', this.currentSessionId);
  }

  // End the current session
  private async endSession(): Promise<void> {
    if (!this.currentSessionId || !this.sessionStartTime) return;

    try {
      const sessionEndTime = new Date();
      const durationMinutes = Math.round(
        (sessionEndTime.getTime() - this.sessionStartTime.getTime()) / (1000 * 60)
      );

      if (this.isOnline && this.currentSessionId < 1000000000000) { // Real DB ID (not timestamp)
        // Try to update session in database
        const { error } = await supabase
          .from('app_usage_sessions')
          .update({
            session_end: sessionEndTime.toISOString(),
            duration_minutes: Math.max(1, durationMinutes),
          })
          .eq('id', this.currentSessionId);

        if (error) {
          console.error('Error ending app usage session:', error);
          // Fall back to offline mode
          await this.endSessionOffline(sessionEndTime, durationMinutes);
        } else {
          console.log(`App usage session ended online. Duration: ${durationMinutes} minutes`);
        }
      } else {
        // End session in offline mode or if using temp ID
        await this.endSessionOffline(sessionEndTime, durationMinutes);
      }
      
      // Reset session data
      this.currentSessionId = null;
      this.sessionStartTime = null;
      this.clearSessionTimeout();
    } catch (error) {
      console.error('Error in endSession:', error);
      // Still try to buffer the data
      if (this.sessionStartTime) {
        const sessionEndTime = new Date();
        const durationMinutes = Math.round(
          (sessionEndTime.getTime() - this.sessionStartTime.getTime()) / (1000 * 60)
        );
        await this.endSessionOffline(sessionEndTime, durationMinutes);
      }
    }
  }

  // End session in offline mode
  private async endSessionOffline(sessionEndTime: Date, durationMinutes: number): Promise<void> {
    if (!this.participantNumber || !this.currentSessionId || !this.sessionStartTime) return;

    // Buffer the session end
    await SessionDataBuffer.bufferSessionData({
      participant_number: this.participantNumber,
      session_start: this.sessionStartTime.toISOString(),
      session_end: sessionEndTime.toISOString(),
      duration_minutes: Math.max(1, durationMinutes),
      app_version: '1.0.0',
      action: 'end',
      session_id: this.currentSessionId,
    });

    console.log(`App usage session ended offline. Duration: ${durationMinutes} minutes`);
  }

  // Set timeout to automatically end session after inactivity
  private setSessionTimeout(): void {
    this.clearSessionTimeout();
    // Auto-end session after 30 minutes of inactivity
    this.sessionTimeoutId = setTimeout(async () => {
      console.log('Session timeout - ending session due to inactivity');
      await this.endSession();
    }, 30 * 60 * 1000); // 30 minutes
  }

  // Clear session timeout
  private clearSessionTimeout(): void {
    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
      this.sessionTimeoutId = null;
    }
  }

  // Handle app state changes
  private handleAppStateChange = async (nextAppState: AppStateStatus): Promise<void> => {
    console.log('App state changed from', this.currentAppState, 'to', nextAppState);
    
    if (!this.participantNumber) return;

    const previousState = this.currentAppState;
    this.currentAppState = nextAppState;

    // App is going to background or becoming inactive
    if ((nextAppState === 'background' || nextAppState === 'inactive') && 
        previousState === 'active') {
      console.log('App going to background - ending session');
      await this.endSession();
    } 
    // App is becoming active from background/inactive
    else if (nextAppState === 'active' && 
             (previousState === 'background' || previousState === 'inactive')) {
      console.log('App becoming active - starting new session');
      // Small delay to ensure state is stable
      setTimeout(async () => {
        if (this.currentAppState === 'active' && !this.currentSessionId) {
          await this.startSession();
        }
      }, 100);
    }
  };

  // Start listening to app state changes
  private startAppStateListener(): void {
    // Remove any existing listener first
    this.stopAppStateListener();
    
    console.log('Starting AppState listener, current state:', AppState.currentState);
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  // Stop listening to app state changes
  private stopAppStateListener(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
      console.log('AppState listener stopped');
    }
  }

  // Get usage statistics for a participant
  async getUsageStats(participantNumber: number, days: number = 30): Promise<{
    totalSessions: number;
    totalMinutes: number;
    averageSessionMinutes: number;
    sessionsPerDay: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('app_usage_sessions')
        .select('duration_minutes, session_start')
        .eq('participant_number', participantNumber)
        .gte('session_start', startDate.toISOString())
        .not('duration_minutes', 'is', null);

      if (error) {
        console.error('Error fetching usage stats:', error);
        return { totalSessions: 0, totalMinutes: 0, averageSessionMinutes: 0, sessionsPerDay: 0 };
      }

      const totalSessions = data.length;
      const totalMinutes = data.reduce((sum, session) => sum + (session.duration_minutes || 0), 0);
      const averageSessionMinutes = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
      const sessionsPerDay = Math.round((totalSessions / days) * 10) / 10; // Round to 1 decimal

      return {
        totalSessions,
        totalMinutes,
        averageSessionMinutes,
        sessionsPerDay,
      };
    } catch (error) {
      console.error('Error in getUsageStats:', error);
      return { totalSessions: 0, totalMinutes: 0, averageSessionMinutes: 0, sessionsPerDay: 0 };
    }
  }

  // Get daily usage data for charts/analytics
  async getDailyUsage(participantNumber: number, days: number = 30): Promise<Array<{
    date: string;
    sessions: number;
    minutes: number;
  }>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('app_usage_sessions')
        .select('duration_minutes, session_start')
        .eq('participant_number', participantNumber)
        .gte('session_start', startDate.toISOString())
        .not('duration_minutes', 'is', null)
        .order('session_start', { ascending: true });

      if (error) {
        console.error('Error fetching daily usage:', error);
        return [];
      }

      // Group by date
      const dailyData: { [key: string]: { sessions: number; minutes: number } } = {};
      
      data.forEach(session => {
        const date = new Date(session.session_start).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { sessions: 0, minutes: 0 };
        }
        dailyData[date].sessions += 1;
        dailyData[date].minutes += session.duration_minutes || 0;
      });

      // Convert to array format
      return Object.entries(dailyData).map(([date, data]) => ({
        date,
        sessions: data.sessions,
        minutes: data.minutes,
      }));
    } catch (error) {
      console.error('Error in getDailyUsage:', error);
      return [];
    }
  }
}

// Export singleton instance
export const appUsageTracker = new AppUsageTracker();
