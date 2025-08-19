import React, { createContext, useContext, useState, useEffect } from 'react';
import { Department, StudyGroup } from '../types';
import { getDeviceId } from '../utils/deviceId';
import { supabase } from '../utils/supabase';

interface ParticipantContextType {
  participantId: string | null;
  studyGroup: StudyGroup | null;
  department: Department | null;
  isLoading: boolean;
  setParticipantData: (data: { studyGroup: StudyGroup; department: Department }) => Promise<void>;
  hasCompletedOnboarding: boolean;
  setOnboardingComplete: () => Promise<void>;
}

const ParticipantContext = createContext<ParticipantContextType | null>(null);

export const useParticipant = () => {
  const context = useContext(ParticipantContext);
  if (!context) {
    throw new Error('useParticipant must be used within a ParticipantProvider');
  }
  return context;
};

export const ParticipantProvider = ({ children }: { children: React.ReactNode }) => {
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [studyGroup, setStudyGroup] = useState<StudyGroup | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    loadParticipant();
  }, []);

  const loadParticipant = async () => {
    try {
      const fingerprint = await getDeviceId();
      console.log('Loading participant with fingerprint:', fingerprint);

      // First try to get all matching participants (should be 0 or 1)
      const { data: participants, error } = await supabase
        .from('participants')
        .select('*')
        .eq('device_fingerprint', fingerprint);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Check if we found a participant
      const existingParticipant = participants?.[0];
      if (!existingParticipant) {
        console.log('No participant found for this device - normal for first-time users');
        return;
      }

      if (existingParticipant) {
        console.log('Found existing participant:', existingParticipant);
        setParticipantId(existingParticipant.id);
        setStudyGroup(existingParticipant.study_group);
        setDepartment(existingParticipant.department);
        setHasCompletedOnboarding(existingParticipant.completed_onboarding || false);
      }
    } catch (error) {
      console.error('Error loading participant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setParticipantData = async (data: { studyGroup: StudyGroup; department: Department }) => {
    try {
      const fingerprint = await getDeviceId();
      console.log('Creating new participant with fingerprint:', fingerprint);

      const { data: participants, error } = await supabase
        .from('participants')
        .insert([
          {
            device_fingerprint: fingerprint,
            study_group: data.studyGroup,
            department: data.department,
            completed_onboarding: false,
          },
        ])
        .select();

      if (error) {
        console.error('Error inserting participant:', error);
        throw error;
      }

      const newParticipant = participants?.[0];
      if (!newParticipant) {
        throw new Error('Failed to create participant record');
      }

      setParticipantId(newParticipant.id);
      setStudyGroup(data.studyGroup);
      setDepartment(data.department);
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error('Error setting participant data:', error);
      throw error;
    }
  };

  const setOnboardingComplete = async () => {
    try {
      const fingerprint = await getDeviceId();

      const { error } = await supabase
        .from('participants')
        .update({ completed_onboarding: true })
        .eq('device_fingerprint', fingerprint);

      if (error) throw error;

      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  return (
    <ParticipantContext.Provider
      value={{
        participantId,
        studyGroup,
        department,
        isLoading,
        hasCompletedOnboarding,
        setParticipantData,
        setOnboardingComplete,
      }}
    >
      {children}
    </ParticipantContext.Provider>
  );
};
