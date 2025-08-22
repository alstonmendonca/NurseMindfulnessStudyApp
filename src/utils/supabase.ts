import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@env";
import { getDeviceId } from "./deviceId";

const options = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  },
};

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, options);

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error("Supabase error:", {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });
  throw error;
};

// Optional: still works for functions
export async function callSupabaseFunction(fnName: string, body?: any) {
  try {
    const deviceId = await getDeviceId();
    const response = await supabase.functions.invoke(fnName, {
      body,
      headers: {
        "x-device-fingerprint": deviceId,
      },
    });

    if (response.error) {
      handleSupabaseError(response.error);
    }

    return response;
  } catch (error) {
    console.error("Failed to invoke Supabase function:", error);
    throw error;
  }
}
