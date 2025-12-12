import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { storeAuth, getStoredAuth, clearStoredAuth } from '../utils/authStorage';
import { appUsageTracker } from '../utils/appUsageTracker';

interface AuthContextType {
  participantNumber: number | null;
  login: (number: string, password: string) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Restore auth state on mount
  useEffect(() => {
    (async () => {
      try {
        const storedAuth = await getStoredAuth();
        if (storedAuth) {
          setParticipantNumber(storedAuth.participantNumber);
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
      if (participantNumber) {
        // Tracking will be started from HomeScreen after it loads properly
        // This ensures we don't start tracking during loading screens
      } else {
        // Stop tracking when user logs out
        await appUsageTracker.stopTracking();
      }
    };

    // Only run if we're not initializing
    if (!isInitializing) {
      handleUsageTracking();
    }
  }, [participantNumber, isInitializing]);

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
    setIsLoading(false);
    await clearStoredAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        participantNumber,
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
