import { createClient } from '@supabase/supabase-js';
import { secureStorage } from './secureStorage';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, 
    storage: {
      getItem: (key) => secureStorage.get(key),
      setItem: (key, value) => secureStorage.set(key, value),
      removeItem: (key) => secureStorage.delete(key),
    },
  },
});