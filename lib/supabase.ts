import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL: Supabase URL or Anon Key is missing!');
  console.log('Available Env Keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
} else {
  console.log('Supabase client initialized with URL:', supabaseUrl.substring(0, 20) + '...');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('Supabase client instance created.');
