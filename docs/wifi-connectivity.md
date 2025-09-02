# WiFi Connectivity and Offline Session Buffering

## Overview

This implementation ensures the meditation app only operates with WiFi connectivity while maintaining robust offline session tracking capabilities. When WiFi is unavailable, session data is buffered locally and synchronized when connectivity is restored.

## Key Features

### 1. WiFi-Only Operation
- App requires WiFi connection to function
- Real-time connectivity monitoring
- User-friendly WiFi requirement screen
- Automatic app access when WiFi is restored

### 2. Offline Session Buffering
- Session data is buffered locally when offline
- Automatic synchronization when back online
- Data integrity maintained during connectivity transitions
- Orphaned session cleanup on app restart

### 3. Enhanced Usage Tracking
- Robust AppState detection with timeout fallbacks
- Network-aware session management
- Comprehensive error handling and recovery

## Architecture

### Components

#### NetworkManager (`src/utils/networkManager.ts`)
- Monitors network connectivity using `@react-native-community/netinfo`
- Differentiates between WiFi and cellular connections
- Provides real-time connectivity state updates
- Manages connectivity listeners

#### SessionDataBuffer (`src/utils/networkManager.ts`)
- Handles offline session data storage using `AsyncStorage`
- Queues session starts, ends, and updates
- Syncs buffered data to Supabase when online
- Handles both new sessions and session updates

#### WiFiRequiredScreen (`src/components/WiFiRequiredScreen.tsx`)
- User interface for WiFi requirement enforcement
- Real-time connectivity status display
- Retry functionality
- Auto-proceed when WiFi becomes available

#### Enhanced AppUsageTracker (`src/utils/appUsageTracker.ts`)
- Network-aware session management
- Offline session buffering integration
- Improved AppState detection with timeouts
- Orphaned session cleanup
- Automatic data synchronization

### Integration Points

#### App.tsx
- WiFi connectivity check before app access
- Network state monitoring in AppNavigator
- Seamless integration with existing auth flow

#### AuthContext.tsx
- Maintains existing app usage tracking integration
- Automatic tracking initialization on login
- Proper cleanup on logout

## Usage Scenarios

### Normal Operation (WiFi Connected)
1. User opens app with WiFi connection
2. App proceeds to normal login/onboarding flow
3. Session tracking operates normally with real-time database updates
4. Background/foreground transitions tracked accurately

### WiFi Loss During Session
1. Network manager detects WiFi disconnection
2. Current session continues tracking locally
3. Session end data buffered when app backgrounds/closes
4. WiFiRequiredScreen displayed if user tries to interact
5. Auto-sync when WiFi reconnects

### App Start Without WiFi
1. App checks connectivity on startup
2. WiFiRequiredScreen displayed with connection status
3. Real-time status updates as user enables WiFi
4. Automatic app access when WiFi connects
5. Buffered data syncs on first connection

### Offline Session Recovery
1. App detects orphaned sessions on startup (sessions without end times)
2. Calculates approximate duration using timeout mechanisms
3. Buffers cleanup data for sync when online
4. Maintains data integrity for research purposes

## Database Schema

The existing `app_usage_sessions` table handles both online and offline scenarios:

```sql
CREATE TABLE app_usage_sessions (
  id BIGSERIAL PRIMARY KEY,
  participant_number INTEGER NOT NULL,
  session_start TIMESTAMPTZ NOT NULL,
  session_end TIMESTAMPTZ,
  duration_minutes INTEGER,
  app_version TEXT DEFAULT '1.0.0',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Configuration

### Network Monitoring
- WiFi requirement: Enforced at app level
- Connectivity check interval: Real-time via netinfo events
- Connection timeout: 30 seconds for automatic checks
- Retry logic: Manual retry with 10-second timeout

### Session Management
- Background timeout: 30 seconds before session end
- Orphaned session cleanup: On app initialization
- Buffer sync: Automatic when connectivity restored
- Data retention: All sessions preserved for research integrity

## Testing

### Manual Testing Scenarios
1. **WiFi Toggle Test**: Turn WiFi on/off during app usage
2. **Background Test**: Background app without WiFi, restore WiFi, bring app back
3. **Force Close Test**: Force close app during session, restart
4. **Network Switch Test**: Switch between WiFi networks
5. **Airplane Mode Test**: Enable airplane mode during session

### Test Utility
Use `src/utils/testConnectivity.ts` for automated testing:

```typescript
import { runAllTests } from './src/utils/testConnectivity';

// Run comprehensive connectivity tests
const stopMonitoring = await runAllTests();

// Stop monitoring when done
stopMonitoring();
```

## Error Handling

### Network Errors
- Graceful fallback to offline mode
- User notifications for connectivity issues
- Retry mechanisms with exponential backoff

### Data Sync Errors
- Individual session sync isolation
- Partial sync success handling
- Buffer preservation on sync failures

### App State Errors
- Timeout-based session ending
- Multiple detection mechanisms
- Orphaned session recovery

## Performance Considerations

### Battery Usage
- Efficient network monitoring using native netinfo
- Minimal background processing
- Event-driven updates only

### Storage Management
- Compressed session data storage
- Automatic buffer cleanup after sync
- Limited buffer size (memory management)

### Network Usage
- WiFi-only operation reduces cellular data concerns
- Batch sync operations when possible
- Minimal data footprint for session tracking

## Troubleshooting

### Common Issues

#### "App stuck on WiFi required screen"
- Check device WiFi settings
- Verify internet connectivity (not just WiFi connection)
- Restart app to refresh network state

#### "Session data not syncing"
- Check network connectivity
- Verify Supabase connection
- Check app logs for sync errors

#### "Sessions showing incorrect duration"
- Review AppState detection logs
- Check for force-close scenarios
- Verify timeout mechanisms

### Debug Commands
```bash
# Check network status
adb logcat | grep "Network state"

# Monitor session tracking
adb logcat | grep "App usage session"

# Watch connectivity changes
adb logcat | grep "WiFi\|network\|connectivity"
```

## Future Enhancements

### Potential Improvements
1. **Smart Retry Logic**: Exponential backoff for sync attempts
2. **Data Compression**: Reduce storage footprint for large buffers
3. **Partial Sync**: Resume interrupted sync operations
4. **Analytics Dashboard**: Real-time monitoring of app usage patterns
5. **Offline Indicators**: Visual feedback for buffered data status

### Research Features
1. **Usage Pattern Analysis**: Detailed interaction tracking
2. **Connectivity Impact Study**: How network issues affect usage
3. **Session Quality Metrics**: Completeness and accuracy measurements
