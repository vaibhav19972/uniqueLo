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

/**
 * Catalog read source switch (`VITE_DATA_SOURCE`).
 *
 * - `local` (or `json`): catalog READS (products, categories, reviews) always
 *   come from the bundled JSON seed — even when Supabase keys are set. Use
 *   this on localhost so the storefront tests against local data while the
 *   Admin Studio keeps its live client for uploads.
 * - anything else / unset: previous behavior — reads go to Supabase whenever
 *   keys are configured, JSON fallback otherwise.
 *
 * WRITES (review submit, newsletter subscribe, order placement, storage
 * uploads) always use the live client when configured; they are not gated
 * by this flag.
 */
const dataSource = (import.meta.env.VITE_DATA_SOURCE || '').trim().toLowerCase();

export const isLocalCatalog = (): boolean => {
  return dataSource === 'local' || dataSource === 'json';
};

export const shouldUseSupabaseReads = (): boolean => {
  return isSupabaseConfigured() && !isLocalCatalog();
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
