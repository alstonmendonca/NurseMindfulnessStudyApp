import React, { createContext, useContext, useState, useEffect } from 'react';
import { Department, StudyGroup } from '../types';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';

interface ParticipantContextType {
  participantNumber: number | null;
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
  const { participantNumber, setCompletedOnboarding } = useAuth();
  const [studyGroup, setStudyGroup] = useState<StudyGroup | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    if (participantNumber) {
      loadParticipant();
    } else {
      // Clear data on logout
      setStudyGroup(null);
      setDepartment(null);
      setHasCompletedOnboarding(false);
      setIsLoading(false);
    }
  }, [participantNumber]);

  const loadParticipant = async () => {
    try {
      if (!participantNumber) return;
      const { data: participant, error } = await supabase
        .from('participants')
        .select('*')
        .eq('participant_number', participantNumber)
        .single();
      if (error) throw error;
      if (participant) {
        setStudyGroup(participant.study_group);
        setDepartment(participant.department);
        setHasCompletedOnboarding(participant.completed_onboarding || false);
      }
    } catch (error) {
      console.error('Error loading participant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  let onboardingData: { studyGroup: StudyGroup; department: Department } | null = null;

  const setParticipantData = async (data: { studyGroup: StudyGroup; department: Department }) => {
    // Store the data for when onboarding completes
    onboardingData = data;
    setStudyGroup(data.studyGroup);
    setDepartment(data.department);
    setHasCompletedOnboarding(false);
  };

  const setOnboardingComplete = async () => {
    try {
      if (!participantNumber || !onboardingData) return;
      
      const { error } = await supabase
        .from('participants')
        .update({
          study_group: onboardingData.studyGroup,
          department: onboardingData.department,
          completed_onboarding: true,
        })
        .eq('participant_number', participantNumber);
        
      if (error) throw error;

      // Update all states after successful DB update
      setStudyGroup(onboardingData.studyGroup);
      setDepartment(onboardingData.department);
      setHasCompletedOnboarding(true);
      setCompletedOnboarding(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  return (
    <ParticipantContext.Provider
      value={{
        participantNumber,
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
