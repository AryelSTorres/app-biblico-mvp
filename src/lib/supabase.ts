import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  user_id: string;
  book: string;
  chapter: number;
  comment: string;
  created_at: string;
  updated_at: string;
};

export type BibleCache = {
  id: string;
  book: string;
  chapter: number;
  version: string;
  content: any;
  created_at: string;
};

export type AIExplanationCache = {
  id: string;
  word: string;
  context: string;
  explanation: any;
  created_at: string;
};
