import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { Shift } from '../types';
import { storeShift, getStoredShift, clearStoredShift } from '../utils/storage';

interface SharedContextType {
  currentShift: Shift | null;
  setCurrentShift: (shift: Shift) => void;
  requireShift: () => Promise<boolean>;
  clearShift: () => Promise<void>;
}

const SharedContext = createContext<SharedContextType | null>(null);

export const useShared = () => {
  const context = useContext(SharedContext);
  if (!context) {
    throw new Error('useShared must be used within a SharedProvider');
  }
  return context;
};

export const SharedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentShift, setCurrentShiftState] = useState<Shift | null>(null);

  useEffect(() => {
    // Load stored shift on startup
    getStoredShift().then(shift => {
      if (shift) setCurrentShiftState(shift);
    });
  }, []);

  const setCurrentShift = async (shift: Shift) => {
    await storeShift(shift);
    setCurrentShiftState(shift);
  };

  const requireShift = async (): Promise<boolean> => {
    if (currentShift) return true;

    return new Promise((resolve) => {
      Alert.alert(
        'Select Shift',
        'Please select your current shift to continue.',
        [
          {
            text: 'Day Shift',
            onPress: async () => {
              await setCurrentShift('day');
              resolve(true);
            },
          },
          {
            text: 'Night Shift',
            onPress: async () => {
              await setCurrentShift('night');
              resolve(true);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
        ],
        { cancelable: false }
      );
    });
  };

  const clearShift = async () => {
    await clearStoredShift();
    setCurrentShiftState(null);
  };

  return (
    <SharedContext.Provider
      value={{
        currentShift,
        setCurrentShift,
        requireShift,
        clearShift,
      }}
    >
      {children}
    </SharedContext.Provider>
  );
};
