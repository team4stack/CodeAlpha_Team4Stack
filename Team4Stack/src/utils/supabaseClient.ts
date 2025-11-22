// Supabase Client Utility
// This file contains a single instance of the Supabase client to prevent multiple instances

import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables (must be provided)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Validate that we have the required configuration
if (!supabaseUrl || !supabaseKey) {
  if (import.meta.env.DEV) {
    console.error('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Create a .env file with these values.');
  }
}

// Create a single instance of the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true, // ✅ Session localStorage mein save hogi - auto login enable
    autoRefreshToken: true, // ✅ Token automatically refresh hoga (expire hone se pehle)
    detectSessionInUrl: true, // ✅ URL se session detect hogi (OAuth ke liye)
    // Note: Supabase automatically uses localStorage with key: sb-<project-ref>-auth-token
    // Session automatically save/load hoti hai - user ko next time auto login ho jayega
  }
});