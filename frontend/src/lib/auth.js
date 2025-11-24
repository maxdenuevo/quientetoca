/**
 * Supabase Auth Helper Functions
 * Handles authentication with Google and Microsoft OAuth
 */

import { supabase } from './supabase';

/**
 * Login with Google OAuth
 * @returns {Promise<{error: Error | null}>}
 */
export async function loginWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return { error };
}

/**
 * Login with Microsoft (Azure) OAuth
 * @returns {Promise<{error: Error | null}>}
 */
export async function loginWithMicrosoft() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'email',
    },
  });

  return { error };
}

/**
 * Logout current user
 * @returns {Promise<{error: Error | null}>}
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get current authenticated user
 * @returns {Promise<{user: User | null, error: Error | null}>}
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

/**
 * Subscribe to auth state changes
 * @param {Function} callback - Called with {event, session}
 * @returns {Object} Subscription object with unsubscribe method
 */
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
}

/**
 * Sync user data to users table after auth
 * This ensures we have a user record in our custom users table
 * @param {User} user - Supabase auth user object
 * @returns {Promise<{error: Error | null}>}
 */
export async function syncUserToDatabase(user) {
  if (!user) return { error: new Error('No user provided') };

  const { error } = await supabase
    .from('users')
    .upsert({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id',
    });

  return { error };
}
