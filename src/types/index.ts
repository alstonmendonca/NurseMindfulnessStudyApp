export type StudyGroup = 'control' | 'intervention';
export type Department = 'ICU' | 'ER' | 'Pediatrics' | 'In-Patient' | 'Out-Patient' | 'Other';
export type Shift = 'day' | 'night';

export interface Participant {
  id: string;
  device_id: string;
  device_fingerprint: string;
  study_group: StudyGroup;
  department: Department;
  created_at: string;
  last_active: string;
}

export interface MoodCheck {
  id: string;
  participant_id: string;
  mood_score: number;
  stress_level: number;
  feelings: string[];
  note?: string;
  shift: Shift;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  participant_id: string;
  content: string;
  prompt?: string;
  tags: string[];
  shift: Shift;
  department: Department;
  created_at: string;
}

export interface ResearchCheckIn {
  id: string;
  participant_id: string;
  check_in_type: 'PSS4' | 'COPE' | 'WHO5';
  responses: Record<string, number>;
  created_at: string;
}

export interface DemographicSurvey {
  id: string;
  participant_id: string;
  sample_code: string;
  age_group: string;
  gender: string;
  marital_status: string;
  educational_qualification: string;
  educational_other?: string;
  designation: string;
  income_level: string;
  years_experience: string;
  working_unit: string;
  working_unit_other?: string;
  work_shift: string;
  hours_per_day: string;
  night_shifts_per_month: string;
  night_shifts_other?: string;
  place_of_residence: string;
  residence_other?: string;
  contact_number: string;
  created_at: string;
}
