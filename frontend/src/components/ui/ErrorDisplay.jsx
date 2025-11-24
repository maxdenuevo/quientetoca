import React from 'react';
import PropTypes from 'prop-types';
import { IconAlert, IconRefresh, IconHome } from '../../lib/icons';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from './index';

/**
 * ErrorDisplay - Reusable error display component with Soft UI styling
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
      iconColor: 'text-accent-burdeos',
      borderColor: 'border-accent-burdeos/30',
      bgColor: 'bg-accent-burdeos/10',
    },
    warning: {
      iconColor: 'text-accent-arcilla',
      borderColor: 'border-accent-arcilla/30',
      bgColor: 'bg-accent-arcilla/10',
    },
    info: {
      iconColor: 'text-accent-oliva',
      borderColor: 'border-accent-oliva/30',
      bgColor: 'bg-accent-oliva/10',
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
    <Card
      padding="lg"
      className="max-w-2xl w-full text-center"
      role="alert"
      aria-live="assertive"
    >
      <Card.Body>
        {/* Error Icon */}
        <div className="mb-6 flex justify-center" aria-hidden="true">
          <div className={`p-4 ${styles.bgColor} rounded-soft-lg border ${styles.borderColor}`}>
            <IconAlert
              className={`w-16 h-16 ${styles.iconColor}`}
            />
          </div>
        </div>

        {/* Error Message */}
        <h2
          className="text-2xl font-bold mb-4 text-brand-carbon dark:text-dark-text-primary"
          id="error-title"
        >
          {title}
        </h2>
        {message && (
          <p
            className="text-lg mb-6 text-accent-piedra dark:text-dark-text-secondary max-w-md mx-auto"
            id="error-description"
          >
            {message}
          </p>
        )}

        {/* Action Buttons */}
        {(showRefresh || showHome) && (
          <div className="flex flex-wrap gap-4 justify-center mt-8" role="group" aria-label="Acciones de error">
            {showRefresh && (
              <Button
                variant="secondary"
                onClick={handleRefresh}
                icon={IconRefresh}
                aria-label="Reintentar cargar el contenido"
              >
                Reintentar
              </Button>
            )}

            {showHome && (
              <Button
                variant="primary"
                onClick={handleHome}
                icon={IconHome}
                aria-label="Ir a la página de inicio"
              >
                Ir al Inicio
              </Button>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-brand-marfil dark:bg-dark-bg">
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
