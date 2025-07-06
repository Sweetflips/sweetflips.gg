import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with your URL and anon key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

// Singleton client for authentication - only create once
let authClientInstance: any = null;

export const createClientForAuth = () => {
  if (!authClientInstance && typeof window !== 'undefined') {
    authClientInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    );
  }
  return authClientInstance || supabase;
};

export default supabase;
