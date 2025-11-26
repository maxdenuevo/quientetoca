import { IconGithub } from '../../lib/icons';

/**
 * Footer Component - Neon Editorial Design
 */
export default function Footer() {
  return (
    <footer className="border-t border-neon-border bg-neon-base">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 font-mono text-xs uppercase tracking-wider text-text-secondary">
          <span>{new Date().getFullYear()} quiéntetoca</span>
          <span className="hidden sm:inline text-neon-border">|</span>
          <a
            href="https://github.com/maxdenuevo/quientetoca"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-accent-magenta transition-colors"
          >
            <IconGithub className="w-4 h-4" />
            <span>GitHub</span>
          </a>
          <span className="hidden sm:inline text-neon-border">|</span>
          <a
            href="https://maxdenuevo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent-magenta transition-colors"
          >
            maxdenuevo.com
          </a>
        </div>
      </div>
    </footer>
  );
}
