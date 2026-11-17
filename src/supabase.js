import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kvcnfmldfwdtjxaljjpm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__dXIgQGvrFeYfzYxaynA0A_dBCEabTK';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);