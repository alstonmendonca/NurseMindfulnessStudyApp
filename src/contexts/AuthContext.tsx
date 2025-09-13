import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { storeAuth, getStoredAuth, clearStoredAuth } from '../utils/authStorage';
import { appUsageTracker } from '../utils/appUsageTracker';

interface AuthContextType {
  participantNumber: number | null;
  login: (number: string, password: string) => Promise<void>;
  demographicSurveyCompleted: boolean;
  setDemographicSurveyCompleted: (value: boolean) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
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
  const [demographicSurveyCompleted, setDemographicSurveyCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Restore auth state on mount
  useEffect(() => {
    (async () => {
      try {
        const storedAuth = await getStoredAuth();
        if (storedAuth) {
          setParticipantNumber(storedAuth.participantNumber);
          
          // Check demographic survey completion status from participants table
          const { data: participantData, error: participantError } = await supabase
            .from('participants')
            .select('demographic_survey_completed')
            .eq('participant_number', storedAuth.participantNumber)
            .single();
          
          const hasDemographicSurveyCompleted = !participantError && participantData?.demographic_survey_completed === true;
          setDemographicSurveyCompleted(hasDemographicSurveyCompleted);
          
          // Note: App usage tracking will be started from HomeScreen after it loads
        }
      } catch (error) {
        console.error('Error restoring auth state:', error);
      } finally {
        setIsInitializing(false);
      }
    })();
  }, []);

  // Effect to handle usage tracking when auth state changes
  useEffect(() => {
    const handleUsageTracking = async () => {
      if (participantNumber && demographicSurveyCompleted) {
        // Tracking will be started from HomeScreen after it loads properly
        // This ensures we don't start tracking during loading screens
      } else {
        // Stop tracking when user logs out or doesn't meet criteria
        await appUsageTracker.stopTracking();
      }
    };

    // Only run if we're not initializing
    if (!isInitializing) {
      handleUsageTracking();
    }
  }, [participantNumber, demographicSurveyCompleted, isInitializing]);

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
      
      // Check demographic survey completion status from participants table
      const hasDemographicSurveyCompleted = data.demographic_survey_completed === true;
      
      setParticipantNumber(parsedNumber);
      setDemographicSurveyCompleted(hasDemographicSurveyCompleted);
      await storeAuth(parsedNumber, false); // No longer storing onboarding status
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // Stop usage tracking but don't wait for session sync to complete
    appUsageTracker.stopTrackingFast(); // Use non-blocking version
    
    setParticipantNumber(null);
    setDemographicSurveyCompleted(false);
    setIsLoading(false);
    await clearStoredAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        participantNumber,
        demographicSurveyCompleted,
        setDemographicSurveyCompleted: async (value: boolean) => {
          setDemographicSurveyCompleted(value);
          
          // Update the participants table with the completion status
          if (participantNumber) {
            try {
              const { error } = await supabase
                .from('participants')
                .update({ demographic_survey_completed: value })
                .eq('participant_number', participantNumber);
                
              if (error) {
                console.error('Error updating demographic survey completion status:', error);
              }
            } catch (error) {
              console.error('Error updating demographic survey completion status:', error);
            }
          }
        },
        login,
        logout,
        isAuthenticated: !!participantNumber,
        isLoading,
        isInitializing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
