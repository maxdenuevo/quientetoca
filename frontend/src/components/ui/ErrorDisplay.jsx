import React from 'react';
import PropTypes from 'prop-types';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * ErrorDisplay - Reusable error display component with neobrutalist styling
 *
 * @param {Object} props
 * @param {string} props.title - Main error title
 * @param {string} props.message - Error message or description
 * @param {boolean} [props.showRefresh=false] - Whether to show refresh button
 * @param {boolean} [props.showHome=false] - Whether to show home button
 * @param {Function} [props.onRefresh] - Custom refresh handler
 * @param {string} [props.variant='error'] - Display variant: 'error', 'warning', 'info'
 * @param {boolean} [props.fullScreen=true] - Whether to display as full screen centered
 * @returns {JSX.Element}
 */
function ErrorDisplay({
  title,
  message,
  showRefresh = false,
  showHome = false,
  onRefresh,
  variant = 'error',
  fullScreen = true
}) {
  const navigate = useNavigate();

  const variantStyles = {
    error: {
      iconColor: 'text-christmas-red',
      borderColor: 'border-christmas-red',
      bgColor: 'bg-christmas-red/10',
    },
    warning: {
      iconColor: 'text-christmas-yellow',
      borderColor: 'border-christmas-yellow',
      bgColor: 'bg-christmas-yellow/10',
    },
    info: {
      iconColor: 'text-christmas-green',
      borderColor: 'border-christmas-green',
      bgColor: 'bg-christmas-green/10',
    },
  };

  const styles = variantStyles[variant];

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  const errorContent = (
    <div
      className="card-brutal p-8 max-w-2xl w-full text-center hover:shadow-brutal-lg transition-shadow"
      role="alert"
      aria-live="assertive"
    >
      {/* Error Icon */}
      <div className="mb-6 flex justify-center" aria-hidden="true">
        <div className={`p-4 ${styles.bgColor} rounded-brutal border-2 ${styles.borderColor}`}>
          <AlertCircle
            className={`w-16 h-16 ${styles.iconColor}`}
            strokeWidth={2.5}
          />
        </div>
      </div>

      {/* Error Message */}
      <h2
        className="text-3xl font-bold mb-4 text-gray-900 dark:text-white"
        id="error-title"
      >
        {title}
      </h2>
      {message && (
        <p
          className="text-lg font-semibold mb-6 text-gray-700 dark:text-gray-300 max-w-md mx-auto"
          id="error-description"
        >
          {message}
        </p>
      )}

      {/* Action Buttons */}
      {(showRefresh || showHome) && (
        <div className="flex flex-wrap gap-4 justify-center mt-8" role="group" aria-label="Acciones de error">
          {showRefresh && (
            <button
              onClick={handleRefresh}
              className="btn-secondary px-6 py-3 text-base flex items-center gap-2"
              aria-label="Reintentar cargar el contenido"
            >
              <RefreshCw className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
              <span>Reintentar</span>
            </button>
          )}

          {showHome && (
            <button
              onClick={handleHome}
              className="btn-primary px-6 py-3 text-base flex items-center gap-2"
              aria-label="Ir a la página de inicio"
            >
              <Home className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
              <span>Ir al Inicio</span>
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        {errorContent}
      </div>
    );
  }

  return errorContent;
}

ErrorDisplay.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  showRefresh: PropTypes.bool,
  showHome: PropTypes.bool,
  onRefresh: PropTypes.func,
  variant: PropTypes.oneOf(['error', 'warning', 'info']),
  fullScreen: PropTypes.bool,
};

export default ErrorDisplay;
