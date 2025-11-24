import React from 'react';
import { IconAlert, IconRefresh } from '../lib/icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-brand-marfil dark:bg-dark-bg">
          <div className="bg-white dark:bg-dark-surface rounded-soft-lg shadow-soft p-8 max-w-2xl w-full text-center border border-brand-arena dark:border-dark-border">
            {/* Error Icon */}
            <div className="mb-6 flex justify-center">
              <div className="p-4 bg-accent-burdeos/10 rounded-soft-lg border border-accent-burdeos/30">
                <IconAlert
                  className="w-16 h-16 text-accent-burdeos"
                />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-4xl font-bold mb-4 text-accent-burdeos">
              ¡Oops! Algo salió mal
            </h1>
            <p className="text-lg font-medium mb-6 text-accent-piedra dark:text-dark-text-secondary">
              La aplicación encontró un error inesperado
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-brand-arena/30 dark:bg-dark-surface-hover border border-brand-arena dark:border-dark-border rounded-soft-lg text-left">
                <p className="font-bold text-sm mb-2 text-accent-burdeos">
                  Error: {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="text-xs font-mono text-accent-piedra dark:text-dark-text-secondary">
                    <summary className="cursor-pointer font-bold mb-2">
                      Stack trace
                    </summary>
                    <pre className="whitespace-pre-wrap overflow-auto max-h-48">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold text-white bg-brand-terracota rounded-soft shadow-soft hover:bg-brand-terracota/90 transition-colors"
              >
                <IconRefresh className="w-5 h-5" />
                <span>Recargar Página</span>
              </button>

              <p className="text-sm font-medium text-accent-piedra dark:text-dark-text-secondary">
                Si el problema persiste, contacta al soporte
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
