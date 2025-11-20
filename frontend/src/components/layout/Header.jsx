import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

const Header = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();

  return (
    <header className="fixed top-0 w-full bg-white dark:bg-christmas-black border-b-brutal border-black dark:border-white shadow-brutal z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo and brand name */}
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-3xl font-bold hover:scale-105 transition-transform">
              <span className="text-gradient">quien</span>
              <span className="text-christmas-green">te</span>
              <span className="text-gradient">to.ca</span>
            </span>
          </Link>

          {/* Navigation items */}
          <div className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-brutal border-2 border-black dark:border-white bg-christmas-yellow hover:bg-yellow-400 transition-colors shadow-brutal-sm hover:shadow-brutal active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
            aria-label={t('header.toggleTheme')}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" strokeWidth={2.5} /> : <Moon className="w-5 h-5" strokeWidth={2.5} />}
          </button>

          <button
            onClick={toggleLanguage}
            className="px-4 py-3 rounded-brutal border-2 border-black dark:border-white bg-christmas-green hover:bg-green-500 transition-colors font-bold shadow-brutal-sm hover:shadow-brutal active:shadow-none active:translate-x-[1px] active:translate-y-[1px] text-christmas-black"
            aria-label={t('header.toggleLanguage')}
          >
            {language.toUpperCase()}
          </button>

            <Link
              to="/create"
              className="ml-2 px-5 py-3 rounded-brutal border-brutal border-black bg-christmas-red text-white hover:bg-red-600 transition-colors font-bold shadow-brutal hover:shadow-brutal-lg hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
              {t('header.createGroup')}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;