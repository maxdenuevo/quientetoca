import React from 'react';
import PropTypes from 'prop-types';
import { IconGift } from '../../lib/icons';

/**
 * LoadingSpinner - Reusable loading indicator with Soft UI styling
 *
 * @param {Object} props
 * @param {string} [props.size='md'] - Size of the spinner: 'sm', 'md', 'lg'
 * @param {string} [props.message] - Optional loading message to display
 * @param {boolean} [props.fullScreen=false] - Whether to display as full screen centered
 * @returns {JSX.Element}
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
      {/* Animated Gift Icon */}
      <div className="relative">
        {/* Rotating border */}
        <div
          className={`${sizeClasses[size]} rounded-soft-lg border-2 border-brand-terracota animate-spin`}
          aria-hidden="true"
        />
        {/* Centered Gift Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <IconGift
            className={`${iconSizes[size]} text-brand-terracota animate-pulse`}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Loading Message */}
      {message && (
        <p className="text-lg font-medium text-brand-carbon dark:text-dark-text-primary animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-marfil dark:bg-dark-bg">
        {spinner}
      </div>
    );
  }

  return spinner;
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  message: PropTypes.string,
  fullScreen: PropTypes.bool,
};

export default LoadingSpinner;
