import { useEffect, useCallback } from 'react';
import { IconClose } from '../../lib/icons';

/**
 * Modal Component - Neon Editorial Design
 *
 * Modal con backdrop blur y estilo neon.
 * Cierra con ESC o click fuera.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
}) {
  // Cerrar con ESC
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neon-base/90 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`
          w-full ${sizes[size]}
          bg-neon-surface
          border border-neon-border
          max-h-[90vh] overflow-hidden flex flex-col
          ${className}
        `.trim()}
      >
        {/* Header with laser line */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b-2 border-accent">
            {title && (
              <h2
                id="modal-title"
                className="font-display text-xl uppercase tracking-wide text-text-primary"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-neon-elevated transition-colors ml-auto text-text-secondary hover:text-accent"
                aria-label="Cerrar modal"
              >
                <IconClose className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 text-text-primary font-body">
          {children}
        </div>
      </div>
    </div>
  );
}

// Subcomponentes para estructura
Modal.Footer = function ModalFooter({ children, className = '' }) {
  return (
    <div
      className={`
        flex items-center justify-end gap-3
        p-4 border-t border-neon-border
        bg-neon-elevated
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
};

