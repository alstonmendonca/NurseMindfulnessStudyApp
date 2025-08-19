import { supabase } from './supabase';

export const setupCalmCornerTables = async () => {
  // Create gratitude_entries table
  const { error: gratitudeError } = await supabase.rpc('create_table_if_not_exists', {
    table_name: 'gratitude_entries',
    definition: `
      id uuid default uuid_generate_v4() primary key,
      participant_id uuid references participants(id),
      text text not null,
      shift text not null,
      department text not null,
      timestamp timestamptz default now(),
      created_at timestamptz default now()
    `
  });

  if (gratitudeError) {
    console.error('Error creating gratitude_entries table:', gratitudeError);
  }

  // Create sound_plays table to track sound usage
  const { error: soundError } = await supabase.rpc('create_table_if_not_exists', {
    table_name: 'sound_plays',
    definition: `
      id uuid default uuid_generate_v4() primary key,
      participant_id uuid references participants(id),
      sound_id text not null,
      duration integer not null,
      timestamp timestamptz default now(),
      created_at timestamptz default now()
    `
  });

  if (soundError) {
    console.error('Error creating sound_plays table:', soundError);
  }

  // Create breathing_sessions table
  const { error: breathingError } = await supabase.rpc('create_table_if_not_exists', {
    table_name: 'breathing_sessions',
    definition: `
      id uuid default uuid_generate_v4() primary key,
      participant_id uuid references participants(id),
      duration integer not null,
      completed boolean default true,
      timestamp timestamptz default now(),
      created_at timestamptz default now()
    `
  });

  if (breathingError) {
    console.error('Error creating breathing_sessions table:', breathingError);
  }

  // Create grounding_sessions table
  const { error: groundingError } = await supabase.rpc('create_table_if_not_exists', {
    table_name: 'grounding_sessions',
    definition: `
      id uuid default uuid_generate_v4() primary key,
      participant_id uuid references participants(id),
      exercise_id text not null,
      completed boolean default true,
      timestamp timestamptz default now(),
      created_at timestamptz default now()
    `
  });

  if (groundingError) {
    console.error('Error creating grounding_sessions table:', groundingError);
  }
};

export const trackBreathingSession = async (
  participantId: string,
  duration: number,
  completed: boolean
) => {
  const { error } = await supabase
    .from('breathing_sessions')
    .insert({
      participant_id: participantId,
      duration,
      completed,
    });

  if (error) {
    console.error('Error tracking breathing session:', error);
  }
};

export const trackSoundPlay = async (
  participantId: string,
  soundId: string,
  duration: number
) => {
  const { error } = await supabase
    .from('sound_plays')
    .insert({
      participant_id: participantId,
      sound_id: soundId,
      duration,
    });

  if (error) {
    console.error('Error tracking sound play:', error);
  }
};

export const trackGroundingSession = async (
  participantId: string,
  exerciseId: string,
  completed: boolean
) => {
  const { error } = await supabase
    .from('grounding_sessions')
    .insert({
      participant_id: participantId,
      exercise_id: exerciseId,
      completed,
    });

  if (error) {
    console.error('Error tracking grounding session:', error);
  }
};
