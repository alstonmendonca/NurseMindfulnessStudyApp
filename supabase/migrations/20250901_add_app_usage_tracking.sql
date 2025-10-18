-- Migration: Add app usage sessions tracking table
-- Date: 2025-09-01
-- Purpose: Track participant app usage sessions for research data collection

-- Create app_usage_sessions table
CREATE TABLE IF NOT EXISTS app_usage_sessions (
    id SERIAL PRIMARY KEY,
    participant_number INTEGER NOT NULL REFERENCES participants(participant_number) ON DELETE CASCADE,
    session_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    session_end TIMESTAMPTZ,
    duration_minutes INTEGER,
    app_version VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_duration CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
    CONSTRAINT valid_session_times CHECK (session_end IS NULL OR session_end >= session_start)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_app_usage_participant ON app_usage_sessions(participant_number);
CREATE INDEX IF NOT EXISTS idx_app_usage_date ON app_usage_sessions(session_start);
CREATE INDEX IF NOT EXISTS idx_app_usage_participant_date ON app_usage_sessions(participant_number, session_start DESC);
CREATE INDEX IF NOT EXISTS idx_app_usage_incomplete ON app_usage_sessions(participant_number, session_start) WHERE session_end IS NULL;

-- Add comments for documentation
COMMENT ON TABLE app_usage_sessions IS 'Tracks app usage sessions for research participants';
COMMENT ON COLUMN app_usage_sessions.id IS 'Primary key, auto-incrementing session ID';
COMMENT ON COLUMN app_usage_sessions.participant_number IS 'Foreign key to participants table';
COMMENT ON COLUMN app_usage_sessions.session_start IS 'Timestamp when app session started (app opened)';
COMMENT ON COLUMN app_usage_sessions.session_end IS 'Timestamp when app session ended (app closed/backgrounded)';
COMMENT ON COLUMN app_usage_sessions.duration_minutes IS 'Session duration in minutes, calculated as (session_end - session_start)';
COMMENT ON COLUMN app_usage_sessions.app_version IS 'Version of the app used during this session';
COMMENT ON COLUMN app_usage_sessions.created_at IS 'Timestamp when this record was created';

-- Note: RLS (Row Level Security) policies should be configured at the Supabase dashboard level
-- or through application-level filtering to ensure participants can only access their own data
