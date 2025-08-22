-- Drop existing table
DROP TABLE IF EXISTS research_check_ins;

-- Recreate research_check_ins table with checkin_id
CREATE TABLE research_check_ins (
    checkin_id SERIAL PRIMARY KEY,
    id UUID DEFAULT uuid_generate_v4(),
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    check_in_type TEXT CHECK (check_in_type IN ('PSS4', 'COPE', 'WHO5')),
    responses JSONB NOT NULL,
    shift TEXT CHECK (shift IN ('day', 'night')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
