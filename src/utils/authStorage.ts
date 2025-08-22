import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = '@shanthi_app_auth';

export const storeAuth = async (participantNumber: number) => {
  try {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(participantNumber));
    return true;
  } catch (error) {
    console.error('Error storing auth:', error);
    return false;
  }
};

export const getStoredAuth = async (): Promise<number | null> => {
  try {
    const value = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error getting stored auth:', error);
    return null;
  }
};

export const clearStoredAuth = async () => {
  try {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing stored auth:', error);
    return false;
  }
};
