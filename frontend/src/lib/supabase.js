// ========================================
// QUIENTETO.CA - SUPABASE CLIENT
// ========================================

import { createClient } from '@supabase/supabase-js';
import { config } from './config';

let supabaseClient = null;

// Initialize Supabase client (lazy loading)
export const getSupabase = () => {
  if (config.backendMode !== 'supabase') {
    throw new Error('Supabase client requires backendMode="supabase"');
  }

  if (!supabaseClient) {
    const { url, anonKey } = config.supabase;

    if (!url || !anonKey) {
      throw new Error(
        'Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
      );
    }

    supabaseClient = createClient(url, anonKey);
    if (import.meta.env.DEV) console.log('✅ Supabase client initialized');
  }

  return supabaseClient;
};

// Export for convenience
export const supabase = config.backendMode === 'supabase' ? getSupabase() : null;
