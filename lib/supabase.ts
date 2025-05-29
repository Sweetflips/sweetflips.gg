import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with your URL and anon key
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string
);

export default supabase;
