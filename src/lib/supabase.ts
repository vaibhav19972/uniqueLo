import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/**
 * Strips accidental /rest/v1, /rest/v1/, or trailing slashes.
 * Supabase client automatically appends /rest/v1, so the base URL must not have it.
 */
const sanitizeSupabaseUrl = (url?: string): string => {
  if (!url) return '';
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
};

const supabaseUrl = sanitizeSupabaseUrl(rawUrl);
const supabaseAnonKey = rawKey || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://'));
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
