import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconGift } from '../lib/icons';

/**
 * Auth Callback Page
 * Handles OAuth redirect after Google/Microsoft login
 */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check for error in URL params
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (error) {
      console.error('Auth error:', error, errorDescription);
      // Redirect to home with error
      navigate('/?error=auth_failed', { replace: true });
      return;
    }

    // Success - redirect to home
    // The AuthProvider will handle the session automatically
    const redirectTo = localStorage.getItem('auth_redirect_to') || '/';
    localStorage.removeItem('auth_redirect_to');

    setTimeout(() => {
      navigate(redirectTo, { replace: true });
    }, 1000);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-marfil dark:bg-dark-bg">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-brand-terracota rounded-soft-lg shadow-soft animate-bounce">
          <IconGift className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-brand-carbon dark:text-dark-text-primary">
          Iniciando sesión...
        </h2>
        <p className="text-accent-piedra dark:text-dark-text-secondary">
          Espera un momento
        </p>
      </div>
    </div>
  );
}
