import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";
import { v4 as uuidv4 } from "uuid";
import { Platform } from "react-native";

const DEVICE_ID_KEY = "nurse_app_device_id";

export async function getDeviceId() {
  try {
    let deviceId: string | null = null;

    if (Platform.OS === "web") {
      // ✅ Use localStorage for web
      deviceId = localStorage.getItem(DEVICE_ID_KEY);
      if (!deviceId) {
        deviceId = uuidv4();
        localStorage.setItem(DEVICE_ID_KEY, deviceId);
      }
    } else {
      // ✅ Use SecureStore for iOS/Android
      deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
      if (!deviceId) {
        deviceId = uuidv4();
        await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
      }
    }

    return deviceId;
  } catch (error) {
    console.error("Error managing device ID:", error);
    // Fallback: generate a new UUID (won’t persist if storage fails)
    return uuidv4();
  }
}

export async function getDeviceInfo() {
  const deviceId = await getDeviceId();
  return {
    deviceId,
    brand: Device.brand ?? "Unknown",
    modelName: Device.modelName ?? "Unknown",
    osName: Device.osName ?? Platform.OS,
    osVersion: Device.osVersion ?? "Unknown",
  };
}
