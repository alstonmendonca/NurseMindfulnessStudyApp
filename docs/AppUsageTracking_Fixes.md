# App Usage Tracking - Fixes and Improvements

**Date:** October 17, 2025  
**Status:** ✅ Complete

## Overview

Fixed and improved the app usage tracking system to ensure reliable, accurate session tracking with offline support and proper error handling.

---

## Issues Fixed

### 1. ✅ Session Timeout Race Conditions
**Problem:** Session timeout could end a session while app state change was also trying to end it, causing duplicate attempts.

**Solution:** Added guard in timeout handler to check if session is still active and app state is 'active' before ending.

```typescript
// Now checks before ending
if (this.currentSessionId && this.currentAppState === 'active') {
  await this.endSession();
}
```

### 2. ✅ Offline Data Loss
**Problem:** When offline, session ends were lost and data wasn't recorded in the database.

**Solution:** Implemented offline queue system using AsyncStorage:
- Session ends are queued when offline
- Automatically synced when connection is restored
- Failed syncs remain in queue for retry

### 3. ✅ Initialization Race Conditions
**Problem:** Multiple rapid calls to `initializeTracking()` could create inconsistent state.

**Solution:** Added initialization guards:
- `isInitializing` flag prevents concurrent initialization
- Checks if already initialized for same participant
- Properly stops previous tracking when switching participants

### 4. ✅ Duration Calculation Accuracy
**Problem:** Very short sessions could result in 0 minutes, and calculation wasn't consistent.

**Solution:** 
- Use `Math.max(1, Math.round(durationMs / 60000))` everywhere
- Ensures minimum 1-minute sessions
- Consistent rounding across all session end methods

### 5. ✅ Improved Error Handling and Logging
**Problem:** Inconsistent logging made debugging difficult.

**Solution:** Added clear emoji-based logging:
- ✅ Success operations
- ⚠️ Warnings (offline, queued data)
- ❌ Errors
- 📶 Network status changes
- 📝 Queue operations
- 🚀 Background operations

---

## New Features

### Offline Queue System

**Storage:** AsyncStorage with key `@app_usage_offline_queue`

**Queue Structure:**
```typescript
interface OfflineSessionEnd {
  sessionId: number;
  sessionEnd: string;
  durationMinutes: number;
  timestamp: number;
}
```

**Automatic Sync:** When network reconnects, queued session ends are automatically synced to Supabase.

---

## Database Schema

### Table: `app_usage_sessions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing session ID |
| `participant_number` | INTEGER | NOT NULL, FK | Reference to participants table |
| `session_start` | TIMESTAMPTZ | NOT NULL | When app session started |
| `session_end` | TIMESTAMPTZ | NULL | When app session ended |
| `duration_minutes` | INTEGER | NULL, >= 0 | Session duration (calculated) |
| `app_version` | VARCHAR(20) | NULL | App version used |
| `created_at` | TIMESTAMPTZ | NOT NULL | Record creation time |

### Indexes
- `idx_app_usage_participant` - Fast lookup by participant
- `idx_app_usage_date` - Fast lookup by date
- `idx_app_usage_participant_date` - Combined participant + date queries
- `idx_app_usage_incomplete` - Find incomplete sessions for cleanup

### Constraints
- `valid_duration`: Duration must be NULL or >= 0
- `valid_session_times`: session_end must be NULL or >= session_start

---

## Session Lifecycle

### 1. Session Start
- Triggered when app becomes active (foreground)
- Creates new record in `app_usage_sessions` with `session_start`
- Only starts if participant is logged in and online
- Sets 30-minute inactivity timeout

### 2. Active Session
- Timeout resets on app state changes
- Session ID and start time stored in memory
- Network state monitored for online/offline transitions

### 3. Session End
Triggered by:
- App going to background/inactive
- 30-minute inactivity timeout
- User logout
- App termination (if caught)

### 4. Offline Handling
- If online: Update database immediately
- If offline: Queue session end for later sync
- If database update fails: Queue for retry

### 5. Cleanup
- On app start: Find orphaned sessions (> 1 hour old, no end time)
- Estimate end time as 30 minutes after start
- Update with estimated duration

---

## Usage Statistics

### Available Methods

**`getUsageStats(participantNumber, days)`**
Returns:
```typescript
{
  totalSessions: number;
  totalMinutes: number;
  averageSessionMinutes: number;
  sessionsPerDay: number;
}
```

**`getDailyUsage(participantNumber, days)`**
Returns daily breakdown:
```typescript
Array<{
  date: string;
  sessions: number;
  minutes: number;
}>
```

---

## Implementation Details

### Initialization
```typescript
// Called from HomeScreen when participant logs in
await appUsageTracker.initializeTracking(participantNumber);
```

### Cleanup on Logout
```typescript
// Fast, non-blocking cleanup
appUsageTracker.stopTrackingFast();
```

### Network Monitoring
- Automatically monitors connection state via `networkManager`
- Triggers sync when reconnecting
- Queues data when offline

---

## Testing Checklist

- [ ] Session starts when app opens
- [ ] Session ends when app backgrounds
- [ ] Session ends after 30 minutes of inactivity
- [ ] Offline sessions are queued
- [ ] Queued sessions sync when back online
- [ ] Orphaned sessions cleaned up on next start
- [ ] Multiple rapid initializations handled gracefully
- [ ] Participant switch properly stops old tracking
- [ ] Duration calculations accurate (minimum 1 minute)
- [ ] Statistics display correctly in UsageStats component

---

## Migration Notes

### Database Migration
Run the migration file:
```sql
supabase/migrations/20250901_add_app_usage_tracking.sql
```

### Required Dependencies
- `@react-native-async-storage/async-storage` - Already installed ✅
- Network connectivity via existing `networkManager` ✅

---

## Future Enhancements

### Potential Improvements
1. Add session metadata (screen visited, actions taken)
2. Track specific feature usage within sessions
3. Add session quality metrics (crash rate, errors)
4. Implement session replay for debugging
5. Add analytics dashboard for researchers

### Performance Optimizations
1. Batch sync multiple queued sessions
2. Compress queue data for large offline periods
3. Add configurable sync intervals
4. Implement exponential backoff for failed syncs

---

## Support

For issues or questions about app usage tracking:
1. Check console logs for emoji-coded messages
2. Verify network connectivity status
3. Check AsyncStorage for queued sessions
4. Review Supabase logs for database errors

**Log Patterns:**
- `✅` - Successful operations
- `⚠️` - Warnings, queued operations
- `❌` - Errors requiring attention
- `📶` - Network state changes
- `📝` - Queue operations
- `🚀` - Background/async operations
