import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  alert('ATENÇÃO: As chaves do Supabase (VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY) não foram encontradas! Verifique o arquivo .env no PC ou as Environment Variables na Vercel.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);