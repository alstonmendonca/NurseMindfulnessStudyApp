// Test utility for WiFi connectivity and offline session buffering
import { networkManager, SessionDataBuffer } from './networkManager';

export class ConnectivityTester {
  // Test basic connectivity detection
  static async testConnectivityDetection(): Promise<void> {
    console.log('=== Testing Connectivity Detection ===');
    
    try {
      // Initialize network manager
      const initialState = await networkManager.initialize();
      console.log('Initial network state:', initialState);
      
      // Check connectivity methods
      console.log('Has internet connection:', networkManager.hasInternetConnection());
      console.log('Is WiFi connected:', networkManager.isWiFiConnected());
      console.log('Current state:', networkManager.getCurrentState());
      
    } catch (error) {
      console.error('Error testing connectivity:', error);
    }
  }

  // Test session data buffering
  static async testSessionBuffering(): Promise<void> {
    console.log('=== Testing Session Buffering ===');
    
    try {
      // Clear any existing buffer
      await SessionDataBuffer.clearBuffer();
      
      // Buffer some test session data
      await SessionDataBuffer.bufferSessionData({
        participant_number: 9999,
        session_start: new Date().toISOString(),
        app_version: '1.0.0',
        action: 'start',
        session_id: Date.now(),
      });
      
      await SessionDataBuffer.bufferSessionData({
        participant_number: 9999,
        session_start: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        session_end: new Date().toISOString(),
        duration_minutes: 5,
        app_version: '1.0.0',
        action: 'end',
        session_id: Date.now() - 1,
      });
      
      // Check buffer count
      const bufferCount = await SessionDataBuffer.getBufferCount();
      console.log('Buffered sessions count:', bufferCount);
      
      // Get buffered sessions
      const bufferedSessions = await SessionDataBuffer.getBufferedSessions();
      console.log('Buffered sessions:', bufferedSessions);
      
      // Test sync (this will fail if offline, which is expected)
      if (networkManager.hasInternetConnection()) {
        console.log('Testing sync to database...');
        await SessionDataBuffer.syncToDatabase();
        
        const afterSyncCount = await SessionDataBuffer.getBufferCount();
        console.log('Buffer count after sync:', afterSyncCount);
      } else {
        console.log('Offline - skipping sync test');
      }
      
    } catch (error) {
      console.error('Error testing session buffering:', error);
    }
  }

  // Test connectivity monitoring
  static testConnectivityMonitoring(): () => void {
    console.log('=== Testing Connectivity Monitoring ===');
    
    const listener = (state: any) => {
      console.log('Network state changed:', state);
      console.log('WiFi connected:', networkManager.isWiFiConnected());
      console.log('Internet available:', networkManager.hasInternetConnection());
    };
    
    networkManager.addConnectivityListener(listener);
    
    console.log('Connectivity monitoring started. Change your network to see updates.');
    
    // Return cleanup function
    return () => {
      networkManager.removeConnectivityListener(listener);
      console.log('Connectivity monitoring stopped.');
    };
  }

  // Run all tests
  static async runAllTests(): Promise<() => void> {
    console.log('🚀 Starting WiFi Connectivity and Offline Buffering Tests...\n');
    
    await this.testConnectivityDetection();
    console.log('');
    
    await this.testSessionBuffering();
    console.log('');
    
    const stopMonitoring = this.testConnectivityMonitoring();
    
    console.log('\n✅ All tests completed! Network monitoring is active.');
    console.log('Call the returned function to stop monitoring.');
    
    return stopMonitoring;
  }
}

// Export test functions for easy usage
export const {
  testConnectivityDetection,
  testSessionBuffering,
  testConnectivityMonitoring,
  runAllTests,
} = ConnectivityTester;
