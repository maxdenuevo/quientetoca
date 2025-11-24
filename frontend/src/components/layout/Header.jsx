import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IconSun, IconMoon, IconUser, IconLogout, IconChevronDown } from '../../lib/icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { loginWithGoogle } from '../../lib/auth';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
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

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 w-full bg-brand-marfil dark:bg-dark-bg border-b border-brand-arena dark:border-dark-border shadow-soft z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <span className="text-2xl font-bold hover:opacity-80 transition-opacity lowercase">
              <span className="text-brand-terracota">quién</span>
              <span className="text-brand-carbon dark:text-dark-text-primary">te</span>
              <span className="text-brand-terracota">toca</span>
            </span>
          </Link>

          {/* Navigation + Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Nav links - only show Inicio when not on home */}
            {location.pathname !== '/' && (
              <Link
                to="/"
                className="hidden sm:inline-flex px-3 py-2 text-sm font-medium text-accent-piedra dark:text-dark-text-secondary hover:text-brand-terracota dark:hover:text-brand-terracota-light transition-colors"
              >
                Inicio
              </Link>
            )}

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-soft border border-brand-arena dark:border-dark-border bg-brand-marfil dark:bg-dark-surface hover:bg-brand-arena/50 dark:hover:bg-dark-surface-hover transition-colors"
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? (
                <IconSun className="w-5 h-5 text-accent-arcilla" />
              ) : (
                <IconMoon className="w-5 h-5 text-accent-piedra" />
              )}
            </button>

            {/* Auth section */}
            {!loading && (
              <>
                {isAuthenticated ? (
                  /* User dropdown */
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-soft border border-brand-arena dark:border-dark-border bg-brand-marfil dark:bg-dark-surface hover:bg-brand-arena/50 dark:hover:bg-dark-surface-hover transition-colors"
                      aria-label="Menú de usuario"
                    >
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt={userName}
                          className="w-8 h-8 rounded-full border border-brand-arena dark:border-dark-border"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-brand-terracota text-white flex items-center justify-center font-medium text-sm">
                          {userInitial}
                        </div>
                      )}
                      <span className="hidden sm:inline text-sm font-medium text-brand-carbon dark:text-dark-text-primary max-w-24 truncate">
                        {userName}
                      </span>
                      <IconChevronDown className={`w-4 h-4 text-accent-piedra transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown menu */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-brand-marfil dark:bg-dark-surface rounded-soft-lg border border-brand-arena dark:border-dark-border shadow-soft-lg z-50">
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-brand-arena dark:border-dark-border">
                          <p className="font-medium text-brand-carbon dark:text-dark-text-primary truncate">{userName}</p>
                          <p className="text-sm text-accent-piedra dark:text-dark-text-secondary truncate">{user?.email}</p>
                        </div>

                        {/* Logout */}
                        <div className="py-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-brand-arena/50 dark:hover:bg-dark-surface-hover transition-colors text-accent-burdeos dark:text-accent-burdeos-light"
                          >
                            <IconLogout className="w-4 h-4" />
                            <span className="font-medium">Cerrar Sesión</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Login button */
                  <button
                    onClick={handleLogin}
                    className="flex items-center gap-2 px-3 py-2 rounded-soft border border-brand-arena dark:border-dark-border bg-brand-marfil dark:bg-dark-surface hover:bg-brand-arena/50 dark:hover:bg-dark-surface-hover transition-colors"
                  >
                    <IconUser className="w-4 h-4 text-accent-piedra dark:text-dark-text-secondary" />
                    <span className="hidden sm:inline text-sm font-medium text-brand-carbon dark:text-dark-text-primary">Entrar</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
