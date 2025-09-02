import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { storeAuth, getStoredAuth, clearStoredAuth } from '../utils/authStorage';
import { appUsageTracker } from '../utils/appUsageTracker';

interface AuthContextType {
  participantNumber: number | null;
  login: (number: string, password: string) => Promise<void>;
  completedOnboarding: boolean;
  demographicSurveyCompleted: boolean;
  setCompletedOnboarding: (value: boolean) => void;
  setDemographicSurveyCompleted: (value: boolean) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [participantNumber, setParticipantNumber] = useState<number | null>(null);
  const [completedOnboarding, setCompletedOnboarding] = useState(false);
  const [demographicSurveyCompleted, setDemographicSurveyCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Restore auth state on mount
  useEffect(() => {
    (async () => {
      const storedAuth = await getStoredAuth();
      if (storedAuth) {
        setParticipantNumber(storedAuth.participantNumber);
        setCompletedOnboarding(storedAuth.completedOnboarding);
        
        // Re-check survey status from database
        const { data: surveyData, error: surveyError } = await supabase
          .from('demographic_surveys')
          .select('id')
          .eq('participant_id', storedAuth.participantNumber)
          .single();
        
        const hasDemographicSurveyCompleted = !surveyError && !!surveyData;
        setDemographicSurveyCompleted(hasDemographicSurveyCompleted);
        
        // Start usage tracking if user is authenticated and has completed survey
        if (storedAuth.participantNumber && hasDemographicSurveyCompleted) {
          await appUsageTracker.initializeTracking(storedAuth.participantNumber);
        }
      }
    })();
  }, []);

  // Effect to handle usage tracking when auth state changes
  useEffect(() => {
    const handleUsageTracking = async () => {
      if (participantNumber && demographicSurveyCompleted) {
        // Start tracking when user is logged in and survey is completed
        await appUsageTracker.initializeTracking(participantNumber);
      } else {
        // Stop tracking when user logs out or doesn't meet criteria
        await appUsageTracker.stopTracking();
      }
    };

    handleUsageTracking();
  }, [participantNumber, demographicSurveyCompleted]);

  const login = async (number: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('participant_number', number)
        .eq('participant_password', password)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Invalid credentials');

      const parsedNumber = parseInt(data.participant_number);
      const hasCompletedOnboarding = !!data.completed_onboarding;
      
      // Check if participant_number exists in demographic_surveys table
      const { data: surveyData, error: surveyError } = await supabase
        .from('demographic_surveys')
        .select('id')
        .eq('participant_id', parsedNumber)
        .single();

      // Survey is completed if there's a record with this participant_number in demographic_surveys table
      const hasDemographicSurveyCompleted = !surveyError && !!surveyData;
      
      setParticipantNumber(parsedNumber);
      setCompletedOnboarding(hasCompletedOnboarding);
      setDemographicSurveyCompleted(hasDemographicSurveyCompleted);
      await storeAuth(parsedNumber, hasCompletedOnboarding);
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // Stop usage tracking before clearing auth state
    await appUsageTracker.stopTracking();
    
    setParticipantNumber(null);
    setCompletedOnboarding(false);
    setDemographicSurveyCompleted(false);
    setIsLoading(false);
    await clearStoredAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        participantNumber,
        completedOnboarding,
        demographicSurveyCompleted,
        setCompletedOnboarding: async (value: boolean) => {
      setCompletedOnboarding(value);
      if (participantNumber) {
        await storeAuth(participantNumber, value);
      }
    },
        setDemographicSurveyCompleted: async (value: boolean) => {
          setDemographicSurveyCompleted(value);
          // Note: We don't update the participants table flag anymore
          // The survey completion is tracked by the existence of a record in demographic_surveys table
        },
        login,
        logout,
        isAuthenticated: !!participantNumber,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
