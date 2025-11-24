import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { IconAlert } from '../../lib/icons';

/**
 * Input Component
 *
 * Campo de texto con estilo Soft UI.
 * Soporta label, error, helper text e iconos.
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    iconPosition = 'left',
    fullWidth = true,
    className = '',
    id,
    ...props
  },
  ref
) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const baseStyles = `
    w-full px-4 py-3
    bg-brand-marfil dark:bg-dark-surface
    border rounded-soft
    text-brand-carbon dark:text-dark-text-primary
    placeholder-accent-piedra dark:placeholder-dark-text-secondary
    transition-all duration-200
    focus:outline-none focus:ring-2
  `;

  const stateStyles = error
    ? 'border-accent-burdeos dark:border-accent-burdeos-light focus:border-accent-burdeos focus:ring-accent-burdeos/20'
    : 'border-brand-arena dark:border-dark-border focus:border-brand-terracota dark:focus:border-brand-terracota-light focus:ring-brand-terracota/20';

  const iconPadding = Icon
    ? iconPosition === 'left'
      ? 'pl-10'
      : 'pr-10'
    : '';

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <div className={`${widthClass} ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium mb-2 text-brand-carbon dark:text-dark-text-primary"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div
            className={`
              absolute top-1/2 -translate-y-1/2
              ${iconPosition === 'left' ? 'left-3' : 'right-3'}
              text-accent-piedra dark:text-dark-text-secondary pointer-events-none
            `}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          className={`
            ${baseStyles}
            ${stateStyles}
            ${iconPadding}
          `.trim()}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
      </div>

      {error && (
        <div
          id={`${inputId}-error`}
          className="flex items-center gap-1 mt-1.5 text-sm text-accent-burdeos dark:text-accent-burdeos-light"
          role="alert"
        >
          <IconAlert className="w-4 h-4" />
          {error}
        </div>
      )}

      {helperText && !error && (
        <p
          id={`${inputId}-helper`}
          className="mt-1.5 text-sm text-accent-piedra dark:text-dark-text-secondary"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  icon: PropTypes.elementType,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  id: PropTypes.string,
};

export default Input;
