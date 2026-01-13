// Supabase Client Utility (Client-Side)
// This file contains a single instance of the Supabase client for client components
// Note: Supabase is only used for authentication (sign in/sign out). All database operations go through backend API.

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables (optional - only needed for auth)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Create Supabase client only if keys are provided
// If keys are missing, create a mock client that won't crash but auth won't work
let supabase: SupabaseClient;

if (!supabaseUrl || !supabaseKey) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Authentication will not work. For auth, add these to .env.local');
  }
  
  // Create a mock client that won't crash
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    }
  });
} else {
  // Create a real Supabase client for authentication
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true, // ✅ Session localStorage mein save hogi - auto login enable
      autoRefreshToken: true, // ✅ Token automatically refresh hoga (expire hone se pehle)
      detectSessionInUrl: true, // ✅ URL se session detect hogi (OAuth ke liye)
      // Note: Supabase automatically uses localStorage with key: sb-<project-ref>-auth-token
      // Session automatically save/load hoti hai - user ko next time auto login ho jayega
    }
  });
}

export { supabase };
