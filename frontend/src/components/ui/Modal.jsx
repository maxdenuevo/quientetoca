import { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { IconClose } from '../../lib/icons';

/**
 * Modal Component
 *
 * Modal accesible con backdrop y estilo Soft UI.
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-carbon/50 dark:bg-black/60 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`
          w-full ${sizes[size]}
          bg-brand-marfil dark:bg-dark-surface
          rounded-soft-lg
          border border-brand-arena dark:border-dark-border
          shadow-soft-lg
          max-h-[90vh] overflow-hidden flex flex-col
          ${className}
        `.trim()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-brand-arena dark:border-dark-border">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-bold text-brand-carbon dark:text-dark-text-primary"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-brand-arena dark:hover:bg-dark-surface-hover rounded-soft transition-colors ml-auto text-brand-carbon dark:text-dark-text-primary"
                aria-label="Cerrar modal"
              >
                <IconClose className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 text-brand-carbon dark:text-dark-text-primary">
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
        p-4 border-t border-brand-arena dark:border-dark-border
        bg-brand-arena/30 dark:bg-dark-bg
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  showCloseButton: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
  className: PropTypes.string,
};

Modal.Footer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
