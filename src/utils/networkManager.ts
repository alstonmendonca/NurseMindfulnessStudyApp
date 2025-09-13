import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ConnectivityState {
  isConnected: boolean;
  isWiFi: boolean;
  isInternetReachable: boolean | null;
}

class NetworkManager {
  private netInfoSubscription: NetInfoSubscription | null = null;
  private currentState: ConnectivityState = {
    isConnected: false,
    isWiFi: false,
    isInternetReachable: null,
  };
  private connectivityListeners: ((state: ConnectivityState) => void)[] = [];

  // Initialize network monitoring
  async initialize(): Promise<ConnectivityState> {
    // Get initial state
    const state = await NetInfo.fetch();
    this.updateConnectivityState(state);

    // Start listening for changes
    this.netInfoSubscription = NetInfo.addEventListener(this.handleConnectivityChange);

    return this.currentState;
  }

  // Stop network monitoring
  destroy(): void {
    if (this.netInfoSubscription) {
      this.netInfoSubscription();
      this.netInfoSubscription = null;
    }
    this.connectivityListeners = [];
  }

  // Handle connectivity changes
  private handleConnectivityChange = (state: NetInfoState): void => {
    this.updateConnectivityState(state);
    
    // Notify all listeners
    this.connectivityListeners.forEach(listener => {
      listener(this.currentState);
    });
  };

  // Update internal connectivity state
  private updateConnectivityState(state: NetInfoState): void {
    this.currentState = {
      isConnected: state.isConnected ?? false,
      isWiFi: state.type === 'wifi',
      isInternetReachable: state.isInternetReachable,
    };

    console.log('Network state updated:', this.currentState);
  }

  // Get current connectivity state
  getCurrentState(): ConnectivityState {
    return { ...this.currentState };
  }

  // Check if WiFi is available and connected
  isWiFiConnected(): boolean {
    return this.currentState.isConnected && 
           this.currentState.isWiFi && 
           this.currentState.isInternetReachable === true;
  }

  // Check if any internet connection is available
  hasInternetConnection(): boolean {
    return this.currentState.isConnected && 
           this.currentState.isInternetReachable === true;
  }

  // Add listener for connectivity changes
  addConnectivityListener(listener: (state: ConnectivityState) => void): void {
    this.connectivityListeners.push(listener);
  }

  // Remove connectivity listener
  removeConnectivityListener(listener: (state: ConnectivityState) => void): void {
    this.connectivityListeners = this.connectivityListeners.filter(l => l !== listener);
  }

  // Wait for internet connection (useful for startup)
  async waitForInternetConnection(timeoutMs: number = 30000): Promise<boolean> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkConnection = () => {
        if (this.hasInternetConnection()) {
          resolve(true);
          return;
        }

        if (Date.now() - startTime >= timeoutMs) {
          resolve(false);
          return;
        }

        setTimeout(checkConnection, 1000); // Check every second
      };

      checkConnection();
    });
  }
}

// Buffer manager for offline session data
class SessionDataBuffer {
  private static readonly BUFFER_KEY = 'app_usage_buffer';

  // Save session data to buffer when offline
  static async bufferSessionData(sessionData: {
    participant_number: number;
    session_start: string;
    session_end?: string;
    duration_minutes?: number;
    app_version?: string;
    action: 'start' | 'end' | 'update';
    session_id?: number;
  }): Promise<void> {
    try {
      const existingBuffer = await this.getBufferedSessions();
      const updatedBuffer = [...existingBuffer, {
        ...sessionData,
        buffered_at: new Date().toISOString(),
      }];

      await AsyncStorage.setItem(this.BUFFER_KEY, JSON.stringify(updatedBuffer));
      console.log('Session data buffered:', sessionData);
    } catch (error) {
      console.error('Error buffering session data:', error);
    }
  }

  // Get all buffered session data
  static async getBufferedSessions(): Promise<any[]> {
    try {
      const bufferedData = await AsyncStorage.getItem(this.BUFFER_KEY);
      return bufferedData ? JSON.parse(bufferedData) : [];
    } catch (error) {
      console.error('Error reading buffered sessions:', error);
      return [];
    }
  }

  // Clear buffered session data after successful sync
  static async clearBuffer(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.BUFFER_KEY);
      console.log('Session buffer cleared');
    } catch (error) {
      console.error('Error clearing session buffer:', error);
    }
  }

  // Get count of buffered sessions
  static async getBufferCount(): Promise<number> {
    const buffered = await this.getBufferedSessions();
    return buffered.length;
  }

  // Sync buffered data to database when back online
  static async syncToDatabase(): Promise<void> {
    try {
      const bufferedSessions = await this.getBufferedSessions();
      
      if (bufferedSessions.length === 0) {
        console.log('No buffered sessions to sync');
        return;
      }

      console.log(`Syncing ${bufferedSessions.length} buffered sessions...`);

      // Import supabase here to avoid circular dependencies
      const { supabase } = await import('./supabase');

      for (const session of bufferedSessions) {
        try {
          if (session.action === 'start') {
            // Create new session in database
            const { data, error } = await supabase
              .from('app_usage_sessions')
              .insert({
                participant_number: session.participant_number,
                session_start: session.session_start,
                app_version: session.app_version || '1.0.0',
              })
              .select('id')
              .single();

            if (error) {
              console.error('Error syncing start session:', error);
              continue;
            }

            console.log('Synced session start:', data?.id);
          } else if (session.action === 'end' && session.session_end && session.duration_minutes) {
            // Try to find and update the session
            // If session_id is a timestamp (temp ID), we need to match by participant and start time
            if (session.session_id && session.session_id > 1000000000000) {
              // This is a timestamp-based temp ID, find by participant and start time
              const { error } = await supabase
                .from('app_usage_sessions')
                .update({
                  session_end: session.session_end,
                  duration_minutes: session.duration_minutes,
                })
                .eq('participant_number', session.participant_number)
                .eq('session_start', session.session_start)
                .is('session_end', null);

              if (error) {
                console.error('Error syncing end session by timestamp:', error);
              } else {
                console.log('Synced session end by timestamp');
              }
            } else {
              // Regular session ID
              const { error } = await supabase
                .from('app_usage_sessions')
                .update({
                  session_end: session.session_end,
                  duration_minutes: session.duration_minutes,
                })
                .eq('id', session.session_id);

              if (error) {
                console.error('Error syncing end session:', error);
              } else {
                console.log('Synced session end:', session.session_id);
              }
            }
          }
        } catch (sessionError) {
          console.error('Error syncing individual session:', sessionError);
          // Continue with next session
        }
      }

      // Clear buffer after successful sync
      await this.clearBuffer();
      console.log('Successfully synced all buffered sessions');
    } catch (error) {
      console.error('Error syncing buffered sessions:', error);
      throw error;
    }
  }
}

// Export singleton instances
export const networkManager = new NetworkManager();
export { SessionDataBuffer };
