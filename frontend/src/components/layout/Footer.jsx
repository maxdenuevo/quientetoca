import { IconGithub } from '../../lib/icons';

export default function Footer() {
  return (
    <footer className="border-t border-brand-arena dark:border-dark-border bg-brand-marfil dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-accent-piedra dark:text-dark-text-secondary">
          <span>© {new Date().getFullYear()} quiéntetoca</span>
          <span className="hidden sm:inline">•</span>
          <a
            href="https://github.com/maxdenuevo/quientetoca"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-brand-terracota dark:hover:text-brand-terracota-light transition-colors"
          >
            <IconGithub className="w-4 h-4" />
            <span>GitHub</span>
          </a>
          <span className="hidden sm:inline">•</span>
          <a
            href="https://maxdenuevo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-terracota dark:hover:text-brand-terracota-light transition-colors"
          >
            maxdenuevo.com
          </a>
        </div>
      </div>
    </footer>
  );
}
