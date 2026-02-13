import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  console.log('Creating Supabase client - URL and key are valid');

  // Create client without extra options (same as working hardcoded test)
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}
