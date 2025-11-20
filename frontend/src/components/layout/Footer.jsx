import React from 'react';
import { useTranslation } from 'react-i18next';
import { Github, Mail, Heart, Linkedin, ExternalLink } from 'lucide-react';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-christmas-black border-t-brutal border-black dark:border-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">
              {t('footer.about')}
            </h3>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('footer.description')}
            </p>
            <div className="flex items-center space-x-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
              <Heart className="w-4 h-4 text-christmas-red" strokeWidth={2.5} fill="currentColor" />
              <span>{t('footer.madeWith')}</span>
            </div>
          </div>

          {/* Links Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">
              {t('footer.links')}
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://github.com/maxdenuevo/quienteto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 font-semibold hover:text-christmas-green transition-colors"
                >
                  <Github className="w-4 h-4" strokeWidth={2.5} />
                  <span>{t('footer.sourceCode')}</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:max@maxdenuevo.com"
                  className="flex items-center space-x-2 font-semibold hover:text-christmas-red transition-colors"
                >
                  <Mail className="w-4 h-4" strokeWidth={2.5} />
                  <span>{t('footer.contact')}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Created By Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">
              {t('footer.createdBy')}
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://maxdenuevo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 font-semibold hover:text-christmas-yellow transition-colors"
                >
                  <ExternalLink className="w-4 h-4" strokeWidth={2.5} />
                  <span>Max Ihnen</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/ihnen/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 font-semibold hover:text-christmas-green transition-colors"
                >
                  <Linkedin className="w-4 h-4" strokeWidth={2.5} />
                  <span>LinkedIn</span>
                </a>
              </li>
              <li className="pt-2">
                <a
                  href="https://www.patagoniadevs.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 font-semibold hover:text-christmas-red transition-colors"
                >
                  <ExternalLink className="w-4 h-4" strokeWidth={2.5} />
                  <span>Patagonia Devs</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/company/patagonia-devs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 font-semibold hover:text-christmas-green transition-colors"
                >
                  <Linkedin className="w-4 h-4" strokeWidth={2.5} />
                  <span>LinkedIn</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Language Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">
              {t('footer.languages')}
            </h3>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => i18n.changeLanguage('en')}
                className="px-4 py-2 rounded-brutal border-2 border-black dark:border-white bg-white dark:bg-christmas-black font-bold text-sm hover:bg-christmas-yellow transition-colors shadow-brutal-sm hover:shadow-brutal active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
              >
                English
              </button>
              <button
                onClick={() => i18n.changeLanguage('es')}
                className="px-4 py-2 rounded-brutal border-2 border-black dark:border-white bg-white dark:bg-christmas-black font-bold text-sm hover:bg-christmas-green transition-colors shadow-brutal-sm hover:shadow-brutal active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
              >
                Español
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-8 border-t-2 border-black dark:border-white">
          <p className="text-center text-sm font-bold text-gray-700 dark:text-gray-300">
            © {currentYear} quienteto.ca. {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;