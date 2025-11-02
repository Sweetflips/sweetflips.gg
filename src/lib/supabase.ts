import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client with your URL and anon key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

// Singleton client for authentication - only create once
let authClientInstance: SupabaseClient | null = null;

export const createClientForAuth = (): SupabaseClient => {
  if (!authClientInstance && typeof window !== 'undefined') {
    authClientInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    );
  }
  return authClientInstance || supabase;
};

export default supabase;
