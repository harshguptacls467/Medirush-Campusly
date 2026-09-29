import { createClient } from '@supabase/supabase-js';

// Fallback to project's public keys if environment variables are not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ctdgeqtwsrlorcgukzqk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_AphWI-xDhZwqpWcwE-rdXQ_P7FlPvUj';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
