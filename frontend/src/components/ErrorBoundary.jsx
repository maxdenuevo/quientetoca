import React from 'react';
import { IconAlert, IconRefresh } from '../lib/icons';

/**
 * ErrorBoundary - Neon Editorial Design
 *
 * Catches React errors and displays fallback UI.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
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
        <div className="min-h-screen flex items-center justify-center p-4 bg-neon-base">
          <div className="bg-neon-surface border border-neon-border p-8 max-w-2xl w-full text-center">
            {/* Error Icon */}
            <div className="mb-6 flex justify-center">
              <div className="p-4 bg-accent-hotbrick/10 border border-accent-hotbrick/30">
                <IconAlert
                  className="w-16 h-16 text-accent-hotbrick"
                />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="font-display text-4xl uppercase tracking-wide mb-4 text-accent-hotbrick">
              Oops! Algo salio mal
            </h1>
            <p className="text-lg font-body mb-6 text-text-secondary">
              La aplicacion encontro un error inesperado
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-neon-elevated border border-neon-border text-left">
                <p className="font-headline font-bold text-sm mb-2 text-accent-hotbrick">
                  Error: {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="text-xs font-mono text-text-secondary">
                    <summary className="cursor-pointer font-bold mb-2 text-text-primary">
                      Stack trace
                    </summary>
                    <pre className="whitespace-pre-wrap overflow-auto max-h-48 text-text-muted">
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
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-headline font-semibold text-neon-base bg-accent hover:opacity-90 transition-colors uppercase tracking-wider"
              >
                <IconRefresh className="w-5 h-5" />
                <span>Recargar Pagina</span>
              </button>

              <p className="text-sm font-body text-text-secondary">
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
