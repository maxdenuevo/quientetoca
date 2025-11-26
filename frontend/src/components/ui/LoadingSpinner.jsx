import { IconGift } from '../../lib/icons';

/**
 * LoadingSpinner - Neon Editorial Design
 *
 * Spinner con glow effect y tipografia bold.
 */
function LoadingSpinner({
  size = 'md',
  message,
  fullScreen = false
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const spinner = (
    <div
      className="flex flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
      aria-label={message || "Cargando contenido"}
    >
      {/* Animated Gift Icon with glow */}
      <div className="relative">
        {/* Rotating border */}
        <div
          className={`${sizeClasses[size]} border-2 border-neon-border border-t-accent animate-spin`}
          style={{ borderTopColor: 'var(--accent-color)' }}
          aria-hidden="true"
        />
        {/* Centered Gift Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <IconGift
            className={`${iconSizes[size]} text-accent animate-pulse`}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Loading Message */}
      {message && (
        <p className="text-lg font-headline uppercase tracking-wider text-text-primary animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neon-base">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export default LoadingSpinner;
