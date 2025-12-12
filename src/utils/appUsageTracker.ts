import { supabase } from './supabase';
import { AppState, AppStateStatus } from 'react-native';
import { networkManager, ConnectivityState } from './networkManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_QUEUE_KEY = '@app_usage_offline_queue';
const AUDIO_PLAYBACK_KEY = '@audio_is_playing';

// Enable app usage tracking
const TRACKING_ENABLED = false;

export interface AppUsageSession {
  id?: number;
  participant_number: number;
  session_start: string;
  session_end?: string;
  duration_minutes?: number;
  app_version?: string;
  created_at?: string;
}

interface OfflineSessionEnd {
  sessionId: number;
  sessionEnd: string;
  durationMinutes: number;
  timestamp: number;
}

class AppUsageTracker {
  private currentSessionId: number | null = null;
  private sessionStartTime: Date | null = null;
  private participantNumber: number | null = null;
  private appStateSubscription: any = null;
  private currentAppState: AppStateStatus = 'active';
  private sessionTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private backgroundTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private isOnline: boolean = false;
  private networkListener: ((state: ConnectivityState) => void) | null = null;
  private isInitialized: boolean = false;
  private isInitializing: boolean = false;
  private isAudioPlaying: boolean = false;

  // Initialize tracking for a participant
  async initializeTracking(participantNumber: number): Promise<void> {
    // Check if tracking is enabled
    if (!TRACKING_ENABLED) {
      console.log('🚫 App usage tracking is DISABLED (development mode)');
      return;
    }

    // Prevent concurrent initialization
    if (this.isInitializing) {
      console.log('⏳ Initialization already in progress, waiting...');
      // Wait a bit and return
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    // Prevent double initialization for same participant
    if (this.isInitialized && this.participantNumber === participantNumber) {
      console.log('✅ App usage tracking already initialized for participant:', participantNumber);
      return;
    }

    // If tracking is already initialized for a different participant, stop it first
    if (this.isInitialized && this.participantNumber !== participantNumber) {
      console.log('🔄 Switching participant - stopping previous tracking');
      await this.stopTracking();
    }

    this.isInitializing = true;

    try {
      this.participantNumber = participantNumber;
      this.currentAppState = AppState.currentState;
      
      // Initialize network monitoring
      await this.initializeNetworkMonitoring();
      
      // Clean up any orphaned sessions on app start
      await this.cleanupOrphanedSessions();
      
      this.startAppStateListener();
      
      // Only start session if app is currently active
      if (this.currentAppState === 'active') {
        await this.startSession();
      }

      // Add app termination handler for better session cleanup
      this.addTerminationHandler();

      this.isInitialized = true;
      console.log('✅ App usage tracking initialized for participant:', participantNumber);
    } catch (error) {
      console.error('❌ Error initializing app usage tracking:', error);
      this.isInitialized = false;
    } finally {
      this.isInitializing = false;
    }
  }

  // Add handler for app termination/crash scenarios
  private addTerminationHandler(): void {
    // Handle process termination (if available in React Native)
    if (typeof process !== 'undefined' && process.on) {
      const handleTermination = () => {
        console.log('App terminating - ending session immediately');
        this.endSessionFast();
      };

      process.on('exit', handleTermination);
      process.on('SIGINT', handleTermination);
      process.on('SIGTERM', handleTermination);
    }
  }

  // Handle online state change
  private handleOnlineStateChange(isOnline: boolean): void {
    const wasOnline = this.isOnline;
    this.isOnline = isOnline;

    // If just came back online, sync queued session ends
    if (!wasOnline && isOnline) {
      console.log('📶 Back online - syncing queued session ends...');
      this.syncOfflineQueue();
    }
  }

  // Initialize network monitoring
  private async initializeNetworkMonitoring(): Promise<void> {
    const currentState = await networkManager.initialize();
    this.isOnline = networkManager.hasInternetConnection();
    
    this.networkListener = (state: ConnectivityState) => {
      this.handleOnlineStateChange(networkManager.hasInternetConnection());
    };
    
    networkManager.addConnectivityListener(this.networkListener);
    
    // Sync any pending offline session ends when initializing
    if (this.isOnline) {
      await this.syncOfflineQueue();
    }
  }

  // Add session end to offline queue
  private async queueOfflineSessionEnd(sessionId: number, sessionEnd: string, durationMinutes: number): Promise<void> {
    try {
      const queue = await this.getOfflineQueue();
      queue.push({
        sessionId,
        sessionEnd,
        durationMinutes,
        timestamp: Date.now(),
      });
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      console.log(`📝 Queued offline session end for session ${sessionId}`);
    } catch (error) {
      console.error('Error queuing offline session end:', error);
    }
  }

  // Get offline queue from storage
  private async getOfflineQueue(): Promise<OfflineSessionEnd[]> {
    try {
      const queueJson = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      return queueJson ? JSON.parse(queueJson) : [];
    } catch (error) {
      console.error('Error reading offline queue:', error);
      return [];
    }
  }

  // Sync offline queue when back online
  private async syncOfflineQueue(): Promise<void> {
    try {
      const queue = await this.getOfflineQueue();
      if (queue.length === 0) {
        return;
      }

      console.log(`📤 Syncing ${queue.length} queued session ends...`);
      
      let successCount = 0;
      const failedItems: OfflineSessionEnd[] = [];

      for (const item of queue) {
        const { error } = await supabase
          .from('app_usage_sessions')
          .update({
            session_end: item.sessionEnd,
            duration_minutes: item.durationMinutes,
          })
          .eq('id', item.sessionId);

        if (error) {
          console.error(`Failed to sync session ${item.sessionId}:`, error);
          failedItems.push(item);
        } else {
          successCount++;
        }
      }

      // Update queue with only failed items
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(failedItems));
      
      if (successCount > 0) {
        console.log(`✅ Successfully synced ${successCount} offline session ends`);
      }
      if (failedItems.length > 0) {
        console.log(`⚠️ ${failedItems.length} session ends failed to sync and remain queued`);
      }
    } catch (error) {
      console.error('Error syncing offline queue:', error);
    }
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

  // Stop tracking (when user logs out) - Fast version for logout
  stopTrackingFast(): void {
    // End session without waiting for Supabase sync
    this.endSessionFast();
    this.stopAppStateListener();
    this.clearSessionTimeout();
    
    // Clean up network monitoring
    if (this.networkListener) {
      networkManager.removeConnectivityListener(this.networkListener);
      this.networkListener = null;
    }
    
    this.participantNumber = null;
    this.isInitialized = false;
  }

  // Stop tracking (when user logs out) - Original blocking version
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
    this.isInitialized = false;
  }

  // Start a new session
  private async startSession(): Promise<void> {
    if (!TRACKING_ENABLED) return; // Skip if tracking disabled
    
    if (!this.participantNumber || this.currentSessionId) return;

    // Only start session if online
    if (!this.isOnline) {
      console.log('Cannot start session - offline. Session tracking disabled until online.');
      return;
    }

    try {
      this.sessionStartTime = new Date();
      
      // Create session in database
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
        // Reset session data on error
        this.sessionStartTime = null;
        return;
      }

      this.currentSessionId = data.id;
      // Session started successfully (log removed to avoid duplicate with HomeScreen)
      
      // Set up timeout
      this.setSessionTimeout();
    } catch (error) {
      console.error('Error in startSession:', error);
      // Reset session data on error
      this.sessionStartTime = null;
    }
  }

  // End the current session
  private async endSession(): Promise<void> {
    if (!this.currentSessionId || !this.sessionStartTime) {
      console.log('No active session to end');
      return;
    }

    const sessionId = this.currentSessionId;
    const startTime = this.sessionStartTime;
    
    // Clear session data immediately to prevent multiple end calls
    this.currentSessionId = null;
    this.sessionStartTime = null;
    this.clearSessionTimeout();
    this.clearBackgroundTimeout();

    try {
      const sessionEndTime = new Date();
      const durationMs = sessionEndTime.getTime() - startTime.getTime();
      const durationMinutes = Math.max(1, Math.round(durationMs / (1000 * 60)));

      console.log(`Ending session ${sessionId}, duration: ${durationMinutes} minutes`);

      // Try to update database if online, otherwise queue for later
      if (this.isOnline) {
        const { error } = await supabase
          .from('app_usage_sessions')
          .update({
            session_end: sessionEndTime.toISOString(),
            duration_minutes: durationMinutes,
          })
          .eq('id', sessionId);

        if (error) {
          console.error('Error ending app usage session in Supabase:', error);
          // Queue for retry if online but request failed
          await this.queueOfflineSessionEnd(sessionId, sessionEndTime.toISOString(), durationMinutes);
        } else {
          console.log(`✅ App usage session ended successfully in Supabase. Duration: ${durationMinutes} minutes`);
        }
      } else {
        console.warn('⚠️ Offline - queuing session end for sync when back online');
        await this.queueOfflineSessionEnd(sessionId, sessionEndTime.toISOString(), durationMinutes);
      }
    } catch (error) {
      console.error('Error in endSession:', error);
    }
  }

  // Set timeout to automatically end session after inactivity
  private setSessionTimeout(): void {
    this.clearSessionTimeout();
    // Auto-end session after 30 minutes of inactivity
    this.sessionTimeoutId = setTimeout(async () => {
      console.log('⏰ Session timeout - ending session due to 30 minutes of inactivity');
      // Check if session is still active before ending
      if (this.currentSessionId && this.currentAppState === 'active') {
        await this.endSession();
      } else {
        console.log('Session already ended or app not active - skipping timeout end');
      }
    }, 30 * 60 * 1000); // 30 minutes
  }

  // Clear session timeout
  private clearSessionTimeout(): void {
    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
      this.sessionTimeoutId = null;
    }
  }

  // Clear background timeout
  private clearBackgroundTimeout(): void {
    if (this.backgroundTimeoutId) {
      clearTimeout(this.backgroundTimeoutId);
      this.backgroundTimeoutId = null;
    }
  }

  // Set background audio timeout - end session after 2 hours if still in background
  private setBackgroundAudioTimeout(): void {
    this.clearBackgroundTimeout();
    // End session after 2 hours of background audio (safety measure)
    this.backgroundTimeoutId = setTimeout(async () => {
      console.log('⏰ Background audio timeout - ending session after 2 hours');
      if (this.currentSessionId && this.currentAppState !== 'active') {
        await this.endSession();
      }
    }, 2 * 60 * 60 * 1000); // 2 hours
  }

  // Check if audio is currently playing
  private async checkAudioPlayback(): Promise<boolean> {
    try {
      const audioState = await AsyncStorage.getItem(AUDIO_PLAYBACK_KEY);
      return audioState === 'true';
    } catch (error) {
      console.error('Error checking audio playback:', error);
      return false;
    }
  }

  // Set audio playback state (to be called from AudioPlayerScreen)
  async setAudioPlaybackState(isPlaying: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(AUDIO_PLAYBACK_KEY, isPlaying.toString());
      this.isAudioPlaying = isPlaying;
      
      // If audio stopped while in background, end session
      if (!isPlaying && this.currentAppState !== 'active' && this.currentSessionId) {
        console.log('Audio stopped in background - ending session');
        await this.endSession();
      }
    } catch (error) {
      console.error('Error setting audio playback state:', error);
    }
  }

  // Fast end session for logout - fire and forget
  private endSessionFast(): void {
    if (!this.currentSessionId || !this.sessionStartTime) {
      console.log('No active session to end (fast)');
      return;
    }

    const sessionId = this.currentSessionId;
    const startTime = this.sessionStartTime;
    
    // Reset session data immediately to prevent race conditions
    this.currentSessionId = null;
    this.sessionStartTime = null;
    this.clearSessionTimeout();
    this.clearBackgroundTimeout();

    const sessionEndTime = new Date();
    const durationMs = sessionEndTime.getTime() - startTime.getTime();
    const durationMinutes = Math.max(1, Math.round(durationMs / (1000 * 60)));

    console.log(`Fast ending session ${sessionId}, duration: ${durationMinutes} minutes (logout)`);

    // Fire request to Supabase without waiting (if online)
    if (this.isOnline) {
      console.log('🚀 Firing logout session end to Supabase (no wait)...');
      
      supabase
        .from('app_usage_sessions')
        .update({
          session_end: sessionEndTime.toISOString(),
          duration_minutes: durationMinutes,
        })
        .eq('id', sessionId)
        .then(({ error }) => {
          if (error) {
            console.error('❌ Logout session end error:', error);
          } else {
            console.log(`✅ Logout session end fired to Supabase. Duration: ${durationMinutes} minutes`);
          }
        });
    } else {
      console.log('⚠️ Offline during logout - queuing session end');
      // Queue offline without waiting
      this.queueOfflineSessionEnd(sessionId, sessionEndTime.toISOString(), durationMinutes)
        .catch(error => console.error('Error queuing offline session:', error));
    }

    console.log('✅ Session data reset immediately (logout)');
  }

  // Handle app state changes
  private handleAppStateChange = async (nextAppState: AppStateStatus): Promise<void> => {
    console.log('App state changed from', this.currentAppState, 'to', nextAppState);
    
    if (!this.participantNumber) return;

    const previousState = this.currentAppState;
    this.currentAppState = nextAppState;

    // Check if audio is playing
    const audioPlaying = await this.checkAudioPlayback();

    // App is going to background or becoming inactive
    if ((nextAppState === 'background' || nextAppState === 'inactive') && 
        previousState === 'active') {
      
      if (audioPlaying) {
        console.log('App going to background but audio is playing - keeping session active');
        // Don't end session, but set a longer timeout in case audio stops
        this.setBackgroundAudioTimeout();
      } else {
        console.log('App going to background - ending session immediately');
        await this.endSession();
      }
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
