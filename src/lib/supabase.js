import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Credentials come from environment variables (Expo exposes any var prefixed
// with EXPO_PUBLIC_ to the app). Copy .env.example to .env and fill these in.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// The app stays fully usable on mock data until these are set, so nothing
// breaks in Expo Go before the backend is configured.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage, // persist the login session on the device
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // not a web app — no URL-based auth
      },
    })
  : null;
