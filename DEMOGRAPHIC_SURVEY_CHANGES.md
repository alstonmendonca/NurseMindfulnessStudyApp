# Demographic Survey Implementation - Changes Summary

## Overview
Successfully removed all recurring research surveys (PSS4, COPE, WHO5) and replaced them with a one-time demographic survey that appears when users first open the app after onboarding.

## Database Changes Required

### New Migration Files Created:
1. `supabase/migrations/20250831_add_demographic_survey.sql`
2. `supabase/migrations/20250831_remove_research_checkins.sql` (optional)

### Database Schema Changes:

#### New Table: `demographic_surveys`
```sql
CREATE TABLE demographic_surveys (
    id SERIAL PRIMARY KEY,
    participant_id INTEGER REFERENCES participants(participant_number),
    sample_code VARCHAR(50),
    age_group VARCHAR(20),
    gender VARCHAR(20),
    marital_status VARCHAR(50),
    educational_qualification VARCHAR(50),
    educational_other TEXT,
    designation VARCHAR(50),
    income_level VARCHAR(30),
    years_experience VARCHAR(20),
    working_unit VARCHAR(50),
    working_unit_other TEXT,
    work_shift VARCHAR(20),
    hours_per_day VARCHAR(20),
    night_shifts_per_month VARCHAR(30),
    night_shifts_other TEXT,
    place_of_residence VARCHAR(50),
    residence_other TEXT,
    contact_number VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Updated Table: `participants`
```sql
ALTER TABLE participants 
ADD COLUMN demographic_survey_completed BOOLEAN DEFAULT FALSE;
```

#### Optional: Remove old table
```sql
-- Optional (commented out by default)
-- DROP TABLE research_check_ins;
```

## New Files Created

### 1. Demographic Survey Constants
- `src/constants/demographicSurvey.ts` - Contains all 14 survey questions with proper options

### 2. Demographic Question Component  
- `src/components/DemographicQuestion.tsx` - Handles different input types (radio, text, other)

### 3. Demographic Survey Screen
- `src/screens/DemographicSurveyScreen.tsx` - Main survey interface with progress tracking

## Modified Files

### Navigation Changes
- `src/navigation/types.ts` - Added DemographicSurvey route, removed ResearchCheckIn
- `src/navigation/MainNavigator.tsx` - Added demographic survey screen, shows it first if not completed
- `App.tsx` - Modified to check demographic survey completion status

### Authentication Context
- `src/contexts/AuthContext.tsx` - Added demographic survey completion tracking

### Home Screen Cleanup
- `src/screens/HomeScreen.tsx` - Removed all research survey buttons and sections

### Database Schema Documentation
- `supabase/schema.txt` - Updated to reflect new table structure

### Notifications Cleanup
- `src/utils/notifications.ts` - Removed research-related notification types and functions
- `src/hooks/useNotifications.ts` - Removed research check-in notifications
- `src/screens/WhatToExpectScreen.tsx` - Updated description and removed research notifications

### Type Definitions
- `src/types/index.ts` - Added DemographicSurvey interface

## Survey Questions Implemented

The demographic survey includes all 14 questions as specified:

1. Sample code No (text input)
2. Age group (4 options)
3. Gender (2 options)  
4. Marital status (3 options)
5. Educational qualification (5 options + other)
6. Designation (4 options)
7. Income level (4 options)
8. Years of experience (4 options)
9. Working Unit (10 options + other)
10. Work shift (2 options)
11. Hours worked per day (2 options)
12. No. of night shifts per month (4 options + other)
13. Place of Residence (5 options + other)
14. Contact Number (text input)

## App Flow Changes

### Before:
1. Login → Onboarding → Home (with recurring research surveys)

### After:
1. Login → Onboarding → **Demographic Survey** → Home (no research surveys)

## Features Retained
- Daily mood/stress check-ins
- Calm Corner (intervention group)
- Journal (intervention group)  
- Basic notifications for daily check-ins and motivation

## Next Steps

1. **Run Database Migrations**: Execute the migration files in your Supabase dashboard
2. **Test the App**: Verify the demographic survey appears for new users
3. **Optional Cleanup**: Run the optional migration to remove the old research_check_ins table if desired

## Notes
- The demographic survey is mandatory and blocks access to the main app until completed
- Survey data is stored with proper relationships to participants
- All research-related notifications and scheduling have been removed
- The app maintains existing functionality for daily check-ins and intervention features
