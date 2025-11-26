import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IconUser, IconLogout, IconChevronDown } from '../../lib/icons';
import { useAuth } from '../auth/AuthProvider';
import { loginWithGoogle } from '../../lib/auth';

/**
 * Header Component - Neon Editorial Design
 *
 * Header fijo con logo neon y navegacion minimalista.
 * Sin toggle de tema (dark-only).
 */
export default function Header() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = async () => {
    await loginWithGoogle();
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

  // Get user display info
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';
  const userAvatar = user?.user_metadata?.avatar_url;
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="fixed top-0 w-full bg-neon-base/90 backdrop-blur-md border-b border-neon-border z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <span className="font-headline text-2xl font-bold tracking-tight hover:text-glow transition-all">
              <span className="text-accent">quién</span>
              <span className="text-text-primary">te</span>
              <span className="text-accent">toca</span>
            </span>
          </Link>

          {/* Navigation + Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Nav links - only show Inicio when not on home */}
            {location.pathname !== '/' && (
              <Link
                to="/"
                className="hidden sm:inline-flex px-3 py-2 font-mono text-xs uppercase tracking-wider text-text-secondary hover:text-accent-magenta transition-colors"
              >
                Inicio
              </Link>
            )}

            {/* Auth section */}
            {loading ? (
              /* Loading placeholder */
              <div className="w-8 h-8 bg-neon-elevated animate-pulse" />
            ) : isAuthenticated ? (
              /* User dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 border border-neon-border bg-neon-surface hover:border-accent-magenta transition-colors"
                  aria-label="Menú de usuario"
                >
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="w-8 h-8 rounded-full border border-neon-border"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-accent text-neon-base flex items-center justify-center font-headline font-bold text-sm">
                      {userInitial}
                    </div>
                  )}
                  <span className="hidden sm:inline font-headline text-sm text-text-primary max-w-24 truncate">
                    {userName}
                  </span>
                  <IconChevronDown className={`w-4 h-4 text-text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-neon-surface border border-neon-border z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-neon-border">
                      <p className="font-headline text-text-primary truncate">{userName}</p>
                      <p className="font-mono text-xs text-text-secondary truncate">{user?.email}</p>
                    </div>

                    {/* Logout */}
                    <div className="py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-neon-elevated transition-colors text-accent-hotbrick"
                      >
                        <IconLogout className="w-4 h-4" />
                        <span className="font-headline text-sm uppercase">Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Login button */
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 px-3 py-2 border border-neon-border bg-neon-surface hover:border-accent-magenta hover:text-accent-magenta transition-colors"
              >
                <IconUser className="w-4 h-4 text-text-secondary" />
                <span className="hidden sm:inline font-headline text-sm uppercase text-text-primary">Entrar</span>
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
