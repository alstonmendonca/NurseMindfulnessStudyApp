import AsyncStorage from '@react-native-async-storage/async-storage';
import { Shift } from '../types';

const SHIFT_STORAGE_KEY = '@nurse_app_shift';

export const storeShift = async (shift: Shift) => {
  try {
    await AsyncStorage.setItem(SHIFT_STORAGE_KEY, shift);
    return true;
  } catch (error) {
    console.error('Error storing shift:', error);
    return false;
  }
};

export const getStoredShift = async (): Promise<Shift | null> => {
  try {
    const shift = await AsyncStorage.getItem(SHIFT_STORAGE_KEY);
    return shift as Shift | null;
  } catch (error) {
    console.error('Error getting stored shift:', error);
    return null;
  }
};

export const clearStoredShift = async () => {
  try {
    await AsyncStorage.removeItem(SHIFT_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing stored shift:', error);
    return false;
  }
};
