import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-christmas-yellow/10 via-white to-christmas-red/10 dark:from-christmas-black dark:to-christmas-black">
          <div className="card-brutal p-8 max-w-2xl w-full text-center hover:shadow-brutal-xl transition-shadow">
            {/* Error Icon */}
            <div className="mb-6 flex justify-center">
              <div className="p-4 bg-christmas-red/10 rounded-brutal border-2 border-christmas-red">
                <AlertCircle
                  className="w-16 h-16 text-christmas-red"
                  strokeWidth={2.5}
                />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-4xl font-bold mb-4 text-christmas-red">
              ¡Oops! Algo salió mal
            </h1>
            <p className="text-lg font-semibold mb-6 text-gray-700 dark:text-gray-300">
              La aplicación encontró un error inesperado
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-900 border-2 border-gray-400 dark:border-gray-600 rounded-brutal text-left">
                <p className="font-bold text-sm mb-2 text-christmas-red">
                  Error: {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="text-xs font-mono text-gray-600 dark:text-gray-400">
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
                className="btn-primary px-8 py-4 text-lg flex items-center justify-center gap-3 mx-auto"
              >
                <RefreshCw className="w-5 h-5" strokeWidth={2.5} />
                <span>Recargar Página</span>
              </button>

              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
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
