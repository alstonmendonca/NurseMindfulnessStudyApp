import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { storeAuth, getStoredAuth, clearStoredAuth } from '../utils/authStorage';

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

  const [participantNumber, setParticipantNumber] = useState<number | null>(null);
  const [completedOnboarding, setCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Restore auth state on mount
  useEffect(() => {
    (async () => {
      const storedNumber = await getStoredAuth();
      if (storedNumber) {
        setParticipantNumber(storedNumber);
        // Optionally, fetch onboarding status from DB if needed
      }
    })();
  }, []);

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
      setParticipantNumber(parsedNumber);
      setCompletedOnboarding(!!data.completed_onboarding);
      await storeAuth(parsedNumber);
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
    await clearStoredAuth();
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
