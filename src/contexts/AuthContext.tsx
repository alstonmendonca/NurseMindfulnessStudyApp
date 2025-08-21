import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../utils/supabase';

interface AuthContextType {
  participantNumber: number | null;
  login: (number: string, password: string) => Promise<void>;
  completedOnboarding: boolean;
  setCompletedOnboarding: (value: boolean) => void;
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
  // Always start with null, do not auto-login
  const [participantNumber, setParticipantNumber] = useState<number | null>(null);
    const [completedOnboarding, setCompletedOnboarding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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

      setParticipantNumber(parseInt(data.participant_number));
      setCompletedOnboarding(!!data.completed_onboarding);
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setParticipantNumber(null);
    setCompletedOnboarding(false);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        participantNumber,
        completedOnboarding,
        setCompletedOnboarding,
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
