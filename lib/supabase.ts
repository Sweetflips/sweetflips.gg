import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with your URL and anon key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

// Client-side Supabase client for authentication
export const createClientForAuth = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );
};

export default supabase;
