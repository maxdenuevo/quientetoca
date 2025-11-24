import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getCurrentUser,
  onAuthStateChange,
  syncUserToDatabase,
  logout as authLogout
} from '../../lib/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check active session on mount
    checkUser();

    // Listen for auth changes
    const subscription = onAuthStateChange(async (event, session) => {
      if (import.meta.env.DEV) console.log('Auth event:', event);

      setSession(session);

      if (session?.user) {
        setUser(session.user);
        // Sync user to our custom users table
        await syncUserToDatabase(session.user);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  async function checkUser() {
    try {
      const { user: currentUser } = await getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        // Sync to database
        await syncUserToDatabase(currentUser);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    const { error } = await authLogout();

    if (!error) {
      setUser(null);
      setSession(null);
    }

    setLoading(false);
    return { error };
  }

  const value = {
    user,
    session,
    loading,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
