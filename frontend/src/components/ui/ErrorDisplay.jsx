import { IconAlert, IconRefresh, IconHome } from '../../lib/icons';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from './index';

/**
 * ErrorDisplay - Neon Editorial Design
 *
 * Display de errores con estilo neon y glow effects.
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
      iconColor: 'text-accent-hotbrick',
      borderColor: 'border-accent-hotbrick/50',
      bgColor: 'bg-accent-hotbrick/10',
      glowClass: 'shadow-glow-hotbrick',
    },
    warning: {
      iconColor: 'text-accent-magenta',
      borderColor: 'border-accent-magenta/50',
      bgColor: 'bg-accent-magenta/10',
      glowClass: 'shadow-glow-magenta',
    },
    info: {
      iconColor: 'text-accent-pernod',
      borderColor: 'border-accent-pernod/50',
      bgColor: 'bg-accent-pernod/10',
      glowClass: 'shadow-glow-pernod',
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
      className={`max-w-2xl w-full text-center border ${styles.borderColor}`}
      role="alert"
      aria-live="assertive"
    >
      <Card.Body>
        {/* Error Icon */}
        <div className="mb-6 flex justify-center" aria-hidden="true">
          <div className={`p-4 ${styles.bgColor} border ${styles.borderColor}`}>
            <IconAlert
              className={`w-16 h-16 ${styles.iconColor}`}
            />
          </div>
        </div>

        {/* Error Title */}
        <h2
          className={`font-display text-3xl uppercase tracking-wide mb-4 ${styles.iconColor}`}
          id="error-title"
        >
          {title}
        </h2>

        {/* Error Message */}
        {message && (
          <p
            className="text-lg mb-6 text-text-secondary font-body max-w-md mx-auto"
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
                aria-label="Ir a la pagina de inicio"
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-neon-base">
        {errorContent}
      </div>
    );
  }

  return errorContent;
}

export default ErrorDisplay;
