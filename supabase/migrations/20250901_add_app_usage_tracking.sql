-- Add app usage sessions tracking table
CREATE TABLE app_usage_sessions (
    id SERIAL PRIMARY KEY,
    participant_number INTEGER NOT NULL REFERENCES participants(participant_number) ON DELETE CASCADE,
    session_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    session_end TIMESTAMPTZ,
    duration_minutes INTEGER,
    app_version VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX idx_app_usage_participant ON app_usage_sessions(participant_number);
CREATE INDEX idx_app_usage_date ON app_usage_sessions(session_start);
CREATE INDEX idx_app_usage_participant_date ON app_usage_sessions(participant_number, session_start);

-- Note: RLS policies are handled at the application level through proper filtering
-- This ensures better compatibility with Supabase's authentication system
