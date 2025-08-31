-- Add demographic survey table
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

-- Add demographic survey completion flag to participants
ALTER TABLE participants 
ADD COLUMN demographic_survey_completed BOOLEAN DEFAULT FALSE;
