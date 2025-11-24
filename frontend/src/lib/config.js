// ========================================
// QUIENTETO.CA - FRONTEND CONFIGURATION
// ========================================

export const config = {
  // Backend mode: 'supabase' or 'rest'
  backendMode: import.meta.env.VITE_BACKEND_MODE || 'supabase',

  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',

  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },

  // Feature Flags
  features: {
    emails: import.meta.env.VITE_ENABLE_EMAILS === 'true',
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  },

  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'quienteto.ca',
    url: import.meta.env.VITE_APP_URL || 'https://quienteto.ca',
    defaultLanguage: import.meta.env.VITE_DEFAULT_LANGUAGE || 'es',
  },
};

// Validate configuration (runs in all environments)
export const validateConfig = () => {
  const { backendMode, supabase, apiUrl } = config;
  const isDev = import.meta.env.DEV;

  if (backendMode === 'supabase') {
    if (!supabase.url || !supabase.anonKey) {
      const msg = 'Supabase mode requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY';
      if (isDev) {
        console.error('❌', msg);
      }
      throw new Error(msg);
    }
  } else if (backendMode === 'rest') {
    if (!apiUrl) {
      const msg = 'REST mode requires VITE_API_URL';
      if (isDev) {
        console.error('❌', msg);
      }
      throw new Error(msg);
    }
  } else {
    const msg = `Invalid backend mode: ${backendMode}. Use 'supabase' or 'rest'`;
    if (isDev) {
      console.error('❌', msg);
    }
    throw new Error(msg);
  }

  if (isDev) {
    console.log(`✅ Backend mode: ${backendMode}`);
    console.log(`✅ Emails enabled: ${config.features.emails}`);
  }
  return true;
};

// Initialize validation on startup (all environments)
validateConfig();
