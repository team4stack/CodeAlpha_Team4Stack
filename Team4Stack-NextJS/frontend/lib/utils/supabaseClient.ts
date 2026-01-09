// Supabase Client Utility
// This file contains a single instance of the Supabase client to prevent multiple instances

import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables (must be provided)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Validate that we have the required configuration
if (!supabaseUrl || !supabaseKey) {
  if (process.env.NODE_ENV === 'development') {
    console.error('[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Create a .env.local file with these values.');
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