import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = '@shanthi_app_auth';

interface StoredAuthData {
  participantNumber: number;
}

export const storeAuth = async (participantNumber: number, _unused: boolean = false) => {
  try {
    const authData: StoredAuthData = {
      participantNumber
    };
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    return true;
  } catch (error) {
    console.error('Error storing auth:', error);
    return false;
  }
};

export const getStoredAuth = async (): Promise<StoredAuthData | null> => {
  try {
    const value = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!value) return null;
    
    const data = JSON.parse(value);
    // Handle legacy storage format
    if (typeof data === 'number') {
      return {
        participantNumber: data
      };
    }
    // Handle legacy storage format with completedOnboarding
    if (data.participantNumber) {
      return {
        participantNumber: data.participantNumber
      };
    }
    return data;
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
