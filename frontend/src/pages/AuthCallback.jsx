import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconGift } from '../lib/icons';

/**
 * Auth Callback Page - Neon Editorial Design
 *
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
    <div className="min-h-screen flex items-center justify-center bg-neon-base">
      <div className="text-center">
        {/* Animated Gift Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 mb-6 border-2 border-accent animate-pulse">
          <IconGift className="w-10 h-10 text-accent" />
        </div>

        <h2 className="font-display text-3xl uppercase tracking-wide text-text-primary mb-3">
          Iniciando sesion...
        </h2>
        <p className="text-text-secondary font-body">
          Espera un momento
        </p>

        {/* Loading bar */}
        <div className="mt-8 w-48 h-1 bg-neon-border mx-auto overflow-hidden">
          <div className="h-full bg-accent animate-[loading_1s_ease-in-out_infinite]" />
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); width: 50%; }
          50% { transform: translateX(0); width: 100%; }
          100% { transform: translateX(200%); width: 50%; }
        }
      `}</style>
    </div>
  );
}
