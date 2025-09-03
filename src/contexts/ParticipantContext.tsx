import React, { createContext, useContext, useState, useEffect } from 'react';
import { Department, StudyGroup } from '../types';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';

interface ParticipantContextType {
  participantNumber: number | null;
  studyGroup: StudyGroup | null;
  department: Department | null;
  isLoading: boolean;
  setParticipantData: (data: { department: Department }) => Promise<void>;
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
  const { participantNumber } = useAuth();
  const [studyGroup, setStudyGroup] = useState<StudyGroup | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (participantNumber) {
      loadParticipant();
    } else {
      // Clear data on logout
      setDepartment(null);
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
      }
    } catch (error) {
      console.error('Error loading participant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setParticipantData = async (data: { department: Department }) => {
    try {
      if (!participantNumber) return;
      
      const { error } = await supabase
        .from('participants')
        .update({
          department: data.department,
        })
        .eq('participant_number', participantNumber);
        
      if (error) throw error;

      // Update state after successful DB update
      setDepartment(data.department);
    } catch (error) {
      console.error('Error updating participant data:', error);
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
        setParticipantData,
      }}
    >
      {children}
    </ParticipantContext.Provider>
  );
};
