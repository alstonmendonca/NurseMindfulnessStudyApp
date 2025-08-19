-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create participants table
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_fingerprint TEXT NOT NULL UNIQUE,
    study_group TEXT NOT NULL CHECK (study_group IN ('control', 'intervention')),
    department TEXT CHECK (department IN ('ICU', 'ER', 'Pediatrics', 'In-Patient', 'Out-Patient', 'Other')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW(),
    completed_onboarding BOOLEAN DEFAULT FALSE
);

-- Create mood_checks table
CREATE TABLE mood_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 5),
    stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 5),
    feelings TEXT[] DEFAULT '{}',
    note TEXT,
    shift TEXT CHECK (shift IN ('day', 'night')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create journal_entries table (only for intervention group)
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    prompt TEXT,
    tags TEXT[] DEFAULT '{}',
    shift TEXT CHECK (shift IN ('day', 'night')),
    department TEXT CHECK (department IN ('ICU', 'ER', 'Pediatrics', 'In-Patient', 'Out-Patient', 'Other')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create research_check_ins table
CREATE TABLE research_check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    check_in_type TEXT CHECK (check_in_type IN ('PSS4', 'COPE', 'WHO5')),
    responses JSONB NOT NULL,
    shift TEXT CHECK (shift IN ('day', 'night')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
