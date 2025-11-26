import { forwardRef } from 'react';
import { IconAlert } from '../../lib/icons';

/**
 * Input Component - Neon Editorial Design
 *
 * Campo de texto con estilo dark-only.
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
    bg-neon-surface border border-neon-border
    text-text-primary placeholder-text-muted
    font-body
    transition-all duration-200
    focus:outline-none
  `;

  const stateStyles = error
    ? 'border-accent-hotbrick focus:border-accent-hotbrick focus:shadow-glow-hotbrick'
    : 'focus:border-accent focus:glow-accent';

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
          className="block text-sm font-headline font-medium uppercase tracking-wider mb-2 text-text-primary"
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
              text-text-muted pointer-events-none
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
          className="flex items-center gap-1 mt-1.5 text-sm text-accent-hotbrick font-headline"
          role="alert"
        >
          <IconAlert className="w-4 h-4" />
          {error}
        </div>
      )}

      {helperText && !error && (
        <p
          id={`${inputId}-helper`}
          className="mt-1.5 text-sm text-text-secondary font-body"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
